import { Socket, createConnection } from 'node:net';
import { Duplex } from 'node:stream';
import * as osc from 'osc-min';
import * as slip from 'slip';

export type EosOscMessage = {
    address: string;
    args: any[];
};

/**
 * SLIP-encoded OSC message stream.
 */
export class EosOscStream extends Duplex {
    private readingPaused = false;

    private slipDecoder = new slip.Decoder({
        onError: (_msgBuffer: Uint8Array, errMsg: string) =>
            console.error(`SLIP decoder error: ${errMsg}`),
        onMessage: this.onSlipFrameReceived.bind(this),
    });

    constructor(private socket: Socket) {
        super({ objectMode: true });

        this.wrapSocket();
    }

    static connect(host: string, port = 3037) {
        const socket = createConnection(port, host);

        return new EosOscStream(socket);
    }

    async writeOsc(msg: EosOscMessage) {
        return new Promise<void>((resolve, reject) => {
            this._write(msg, 'binary', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    _write(
        chunk: any,
        encoding: BufferEncoding,
        callback: (error?: Error | null) => void,
    ) {
        const data = osc.toBuffer(chunk);
        const buffer = slip.encode(data);

        this.socket.write(buffer, encoding, callback);
    }

    _read() {
        this.readingPaused = false;
        setImmediate(this.onReadable.bind(this));
    }

    private onReadable() {
        let chunk: any;

        while (null !== (chunk = this.socket.read()) && !this.readingPaused) {
            this.slipDecoder.decode(chunk);
        }
    }

    private onSlipFrameReceived(frame: Uint8Array) {
        let packet: osc.Packet;

        try {
            packet = osc.fromBuffer(frame);
        } catch (err) {
            console.error('Malformed OSC packet:', err);
            return;
        }

        if (packet.oscType === 'bundle') {
            console.warn('Ignoring OSC bundle');
            return;
        }

        // Flatten the message arguments and omit unnecessary fields
        const msg: EosOscMessage = {
            address: (packet as osc.Message).address,
            args: (packet as osc.Message).args.map((arg) => arg.value),
        };

        // Add message to read buffer
        const hasSpace = this.push(msg);

        // Pause reading if consumer is slow
        if (!hasSpace) {
            this.readingPaused = true;
        }
    }

    private wrapSocket() {
        this.socket.on('close', (hadError) => this.emit('close', hadError));
        this.socket.on('connect', () => this.emit('connect'));
        this.socket.on('drain', () => this.emit('drain'));
        this.socket.on('end', () => this.emit('end'));
        this.socket.on('error', (err) => this.emit('error', err));
        this.socket.on('lookup', (err, address, family, host) =>
            this.emit('lookup', err, address, family, host),
        );
        this.socket.on('ready', () => this.emit('ready'));
        this.socket.on('timeout', () => this.emit('timeout'));

        this.socket.on('readable', this.onReadable.bind(this));
    }
}
