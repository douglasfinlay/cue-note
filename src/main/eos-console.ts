import { EventEmitter } from 'events';
import { Address, Argument, Message, TCPSocketPort } from 'osc';
import { ConnectionState, Cue } from '../models/eos';

type RecordTargetUid = string;

const GET_CUE_OSC_ADDRESS =
    /^\/eos\/out\/get\/cue\/1\/(?<cueNumber>\d+|\d+.\d+)/;

const ACTIVE_CUE_OSC_ADDRESS =
    /^\/eos\/out\/active\/cue\/1\/(?<cueNumber>\d+|\d+.\d+$)/;

const PENDING_CUE_OSC_ADDRESS =
    /^\/eos\/out\/pending\/cue\/1\/(?<cueNumber>\d+|\d+.\d+$)/;

const CUE_CHANGED_OSC_ADDRESS =
    /^\/eos\/out\/notify\/cue\/1\/list\/(?<listIndex>\d+)\/(?<listCount>\d+)$/;

export class EosConsole extends EventEmitter {
    private oscConnection: TCPSocketPort;
    private connectionState: ConnectionState = 'disconnected';
    private initialSyncComplete = false;

    private eosVersion: string | null = null;
    private showName: string | null = null;

    private cuesCount = 0;
    private cuesLeftToSync = Infinity;
    private cuesByRecordTargetUid = new Map<RecordTargetUid, Cue>();
    private recordTargetUidByCueNumber = new Map<string, RecordTargetUid>();

    private activeCueNumber: string | null = null;
    private pendingCueNumber: string | null = null;

    private argumentListCache = new Map<Address, Argument[]>();

    constructor(public readonly host: string, public readonly port = 3037) {
        super();

        this.oscConnection = new TCPSocketPort({ address: host, port });
    }

    connect() {
        console.log(`Connecting to EOS console at ${this.host}:${this.port}`);

        this.oscConnection.open(this.host, this.port);

        this.connectionState = 'connecting';
        this.emit('connecting');

        this.oscConnection.once('ready', () => {
            console.log('Connected');

            this.connectionState = 'connected';
            this.emit('connected');

            this.oscConnection.send({
                address: '/eos/user',
                args: [0],
            });

            this.oscConnection.send({
                address: '/eos/get/version',
                args: [],
            });

            this.oscConnection.send({
                address: '/eos/get/cue/1/count',
                args: [],
            });

            this.oscConnection.send({
                address: '/eos/subscribe',
                args: [1],
            });
        });

        this.oscConnection.once('close', () => {
            console.log('EOS connection closed');

            this.connectionState = 'disconnected';
            this.emit('disconnected');

            this.oscConnection.removeAllListeners();
        });

        this.oscConnection.on('error', this.handleOscError.bind(this));
        this.oscConnection.on('message', this.handleOscMessage.bind(this));
    }

    disconnect() {
        console.log('Disconnecting from EOS console');

        this.oscConnection.close();
    }

    executeCommand(
        command: string,
        substitutions: string[],
        newCommand = true,
    ) {
        const msg: Message = {
            address: newCommand ? '/eos/newcmd' : '/eos/cmd',
            args: [command, ...substitutions],
        };

        this.oscConnection.send(msg);
    }

    fireCue(cueListNumber: number, cueNumber: string) {
        const msg: Message = {
            address: `/eos/cue/${cueListNumber}/${cueNumber}/fire`,
            args: [],
        };

        this.oscConnection.send(msg);
    }

    getCues(): Cue[] {
        return Array.from(this.cuesByRecordTargetUid.values());
    }

    get activeCue(): Cue | undefined {
        if (!this.activeCueNumber) {
            return;
        }

        for (const cue of this.cuesByRecordTargetUid.values()) {
            if (cue.cueNumber === this.activeCueNumber) {
                return cue;
            }
        }
    }

    get consoleConnectionState(): ConnectionState {
        return this.connectionState;
    }

    get initialSyncProgress(): number | undefined {
        if (this.initialSyncComplete) {
            return;
        }

        if (!isFinite(this.cuesLeftToSync)) {
            // Haven't yet received the total cue count, so treat sync as not started
            return 0.0;
        }

        return this.cuesLeftToSync <= 0
            ? 1.0
            : 1 - this.cuesLeftToSync / this.cuesCount;
    }

    get isInitialSyncComplete(): boolean {
        return this.initialSyncComplete;
    }

    get pendingCue(): Cue | undefined {
        if (!this.pendingCueNumber) {
            return;
        }

        for (const cue of this.cuesByRecordTargetUid.values()) {
            if (cue.cueNumber === this.pendingCueNumber) {
                return cue;
            }
        }
    }

    getShowName(): string | undefined {
        if (!this.showName) {
            return;
        }

        return this.showName;
    }

    private checkInitialSyncComplete() {
        const complete =
            !!this.eosVersion && !!this.showName && this.cuesLeftToSync === 0;

        this.initialSyncComplete = complete;

        if (complete) {
            this.emit('initial-sync-complete');

            console.log('Initial sync complete');
        }
    }

    private handleOscMessage(msg: Message) {
        console.debug('OSC message:', msg);

        if (msg.address === '/eos/out/get/version') {
            if (msg.args.length < 1) {
                console.warn(
                    `Unexpected argument count for message "${msg.address}" (expect at least 1, got ${msg.args.length})`,
                );
                return;
            }

            this.eosVersion = msg.args[0];
            console.log(`EOS version: ${this.eosVersion}`);
        } else if (msg.address === '/eos/out/show/name') {
            if (msg.args.length < 1) {
                console.warn(
                    `Unexpected argument count for message "${msg.address}" (expect at least 1, got ${msg.args.length})`,
                );
                return;
            }

            this.showName = msg.args[0];
        } else if (msg.address === '/eos/out/get/cue/1/count') {
            if (msg.args.length < 1) {
                console.warn(
                    `Unexpected argument count for message "${msg.address}" (expect at least 1, got ${msg.args.length})`,
                );
                return;
            }

            this.cuesCount = msg.args[0];
            this.cuesLeftToSync = msg.args[0];

            for (let i = 0; i < this.cuesLeftToSync; i++) {
                this.oscConnection.send({
                    address: `/eos/get/cue/1/index/${i}`,
                    args: [],
                });
            }
        } else if (GET_CUE_OSC_ADDRESS.test(msg.address)) {
            this.handleCueMessage(msg);
        } else if (ACTIVE_CUE_OSC_ADDRESS.test(msg.address)) {
            this.activeCueNumber = msg.address.split('/')[6];
            this.emit('active-cue', this.activeCueNumber);
        } else if (PENDING_CUE_OSC_ADDRESS.test(msg.address)) {
            this.pendingCueNumber = msg.address.split('/')[6];
            this.emit('pending-cue', this.pendingCueNumber);
        } else if (CUE_CHANGED_OSC_ADDRESS.test(msg.address)) {
            const changedTargets = expandTargetNumberArguments(
                msg.args.slice(1),
            );

            for (const cueNumber of changedTargets) {
                const getCueMsg: Message = {
                    address: `/eos/get/cue/1/${cueNumber}`,
                    args: [],
                };

                this.oscConnection.send(getCueMsg);
            }
        }

        if (!this.initialSyncComplete) {
            this.checkInitialSyncComplete();
        }
    }

    private handleOscError(err: any) {
        console.error('OSC connection error:', err);
    }

    private handleCueMessage(msg: Message) {
        // Address: /eos/out/get/cue/<cue list number>/<cue number>/<cue part number>/list/<list index>/<list count>
        //
        // Arguments:
        //      0: <uint32: index>
        //      1: <string: OSC UID>
        //      2: <string: label>
        //      3: <uint32: up time duration (ms)>
        //      4: <uint32: up time delay (ms)>
        //      5: <uint32: down time duration (ms)>
        //      6: <uint32: down time delay (ms)>
        //      7: <uint32: focus time duration (ms)>
        //      8: <uint32: focus time delay (ms)>
        //      9: <uint32: color time duration (ms)>
        //     10: <uint32: color time delay (ms)>
        //     11: <uint32: beam time duration (ms)>
        //     12: <uint32: beam time delay (ms)>
        //     13: <bool: preheat>
        //     14: <OSC Number: curve>
        //     15: <uint32: rate>
        //     16: <string: mark>
        //     17: <string: block>
        //     18: <string: assert>
        //     19: <OSC Number: link> or <string: link> (string if links to a separate cue list)
        //     20: <uint32: follow time (ms)>
        //     21: <uint32: hang time (ms)>
        //     22: <bool: all fade>
        //     23: <uint32: loop>
        //     24: <bool: solo>
        //     25: <string: timecode>
        //     26: <uint32: part count> (not including base cue, so zero for cues with no parts)
        //     27: <notes>
        //     28: <scene (text)>
        //     29: <bool: scene end>
        //     30: <cue part index> (-1 if not a part of a cue, the index otherwise)

        let args = msg.args;
        const addressParts = msg.address.split('/');

        if (addressParts.length >= 8) {
            // We don't care about cue actions, fx, links
            if (addressParts[8] !== 'list') {
                return;
            }

            const argListIndex = Number(addressParts[9]);
            const argListCount = Number(addressParts[10]);

            if (argListCount > 0 && argListCount !== args.length) {
                // Packet re-assembly is required
                const cacheKey = addressParts.slice(0, 8).join('/');

                // First packet; create a cache entry with the partial argument list
                if (argListIndex === 0) {
                    this.argumentListCache.set(cacheKey, msg.args);
                    return;
                }

                // Otherwise keep collecting args until we have received the expected amount
                const cachedArgs = this.argumentListCache.get(cacheKey);

                if (!cachedArgs) {
                    console.error(
                        `no argument cache entry found for message: ${msg.address}`,
                    );
                    return;
                }

                cachedArgs.splice(argListIndex, args.length, ...args);

                if (cachedArgs.length !== argListCount) {
                    // Don't process the cue yet as we're expecting to receive more args
                    return;
                }

                // We're ready to process the cue
                args = cachedArgs;
                this.argumentListCache.delete(cacheKey);
            }
        }

        const uid = args[1];

        const cueListNumber = Number(addressParts[5]);
        const cueNumber = addressParts[6];
        const cuePartNumber = Number(addressParts[7]);

        if (!uid) {
            // Cue no longer exists on the console; find our copy and delete it
            const deletedCueUid =
                this.recordTargetUidByCueNumber.get(cueNumber);

            if (deletedCueUid) {
                this.recordTargetUidByCueNumber.delete(cueNumber);
                const deletedCue =
                    this.cuesByRecordTargetUid.get(deletedCueUid);
                this.cuesByRecordTargetUid.delete(deletedCueUid);

                this.emit('cue:deleted', deletedCue);
            }

            return;
        }

        // At this point the cue was either added or updated

        if (args.length < 31) {
            console.error(
                `Cannot process cue message arguments (expect at least 31, got ${msg.args.length})`,
            );
            return;
        }

        const label = args[2];
        const notes = args[27];
        const scene = args[28];
        const isSceneEnd = !!args[29];
        const isPart = args[30] >= 0;

        // TODO: handle cue parts
        if (isPart) {
            this.cuesLeftToSync--;
            return;
        }

        const cue: Cue = {
            cueListNumber,
            cueNumber,
            cuePartNumber,
            isPart,
            isSceneEnd,
            label,
            notes,
            scene,
            uid,
        };

        const updating = this.cuesByRecordTargetUid.has(uid);

        this.cuesByRecordTargetUid.set(uid, cue);
        this.recordTargetUidByCueNumber.set(cueNumber, uid);

        if (!this.initialSyncComplete) {
            this.cuesLeftToSync--;
            this.checkInitialSyncComplete();

            return;
        }

        this.emit(updating ? 'cue:updated' : 'cue:created', cue);
    }
}

/**
 * Parses and expands a target number range into individual target numbers. Target numbers that are not whole will be
 * kept as strings. For example:
 *   - "1.23" => "1.23"
 *   - "3-5" => [3, 4, 5]
 */
function expandTargetNumberArguments(args: Argument[]): string[] {
    const expandedArgs = args.flatMap((arg) => {
        switch (typeof arg) {
            case 'number':
                return String(arg);
            case 'string':
                return parseStringTargetNumberRange(arg);
            default:
                console.error(
                    `unexpected target number argument type: ${typeof arg}`,
                );
                return [];
        }
    });

    // Remove duplicate target numbers
    return Array.from(new Set(expandedArgs));
}

function parseStringTargetNumberRange(arg: string): string[] {
    const parts = arg.split('-');

    if (parts.length === 1) {
        return [parts[0]];
    } else if (parts.length === 2) {
        const lower = Number(parts[0]);
        const upper = Number(parts[1]);

        const targetNumbers: string[] = [];

        for (let i = lower; i <= upper; i++) {
            targetNumbers.push(String(i));
        }

        return targetNumbers;
    } else {
        console.error(`malformed target number argument: ${arg}`);
        return [];
    }
}
