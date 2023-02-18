import {
    ChangeEvent,
    forwardRef,
    KeyboardEvent,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { ConnectionState } from '../../models/eos';

const HOSTNAME =
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$/;
const IPV4_ADDRESS =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_ADDRESS = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/;

interface ConsoleConnectionProps {
    address?: string;
    connectionState: ConnectionState;
    syncProgress?: number;
    onTriggerConnect: (address: string) => void;
    onTriggerDisconnect: () => void;
}

export interface ConsoleConnectionHandle {
    focus: () => void;
}

const ConsoleConnection = forwardRef<
    ConsoleConnectionHandle,
    ConsoleConnectionProps
>((props, ref) => {
    const [host, setHost] = useState('');
    const [isHostValid, setIsHostValid] = useState(false);
    const [syncProgress, setSyncProgress] = useState<number | null>(null);

    const refHostInput = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => {
        return {
            focus() {
                refHostInput.current?.focus();
            },
        };
    });

    const onHostChanged = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setHost(value);

        const valid =
            value.length <= 255 &&
            (HOSTNAME.test(value) ||
                IPV4_ADDRESS.test(value) ||
                IPV6_ADDRESS.test(value));

        setIsHostValid(valid);
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            props.onTriggerConnect(host);
        }
    };

    useEffect(() => {
        setHost(props.address ?? '');
    }, [props.address]);

    useEffect(() => {
        let progress = props.syncProgress;

        if (progress === undefined) {
            setSyncProgress(null);
            return;
        }

        progress = progress * 100;
        progress = Math.min(Math.max(progress, 0), 100);
        setSyncProgress(progress);
    }, [props.syncProgress]);

    return (
        <div className='flex flex-col gap-2'>
            {props.syncProgress !== undefined && (
                <div>
                    <span className='text-eos-grey-light'>Syncing...</span>
                    <div className='w-full border border-eos-grey-light rounded h-2.5'>
                        <div
                            className='bg-eos-grey-light h-full rounded'
                            style={{ width: `${syncProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}
            <div className='flex'>
                <input
                    ref={refHostInput}
                    type='text'
                    className='flex-grow px-2 rounded bg-black border border-solid border-eos-yellow disabled:opacity-50'
                    placeholder='EOS Console IP Address'
                    disabled={props.connectionState !== 'disconnected'}
                    value={host}
                    onChange={onHostChanged}
                    onKeyDown={onKeyDown}
                ></input>

                {props.connectionState === 'connected' ? (
                    <button
                        className='px-3 py-1 ml-2 rounded bg-eos-grey-dark border-2 border-solid border-eos-grey-light'
                        onClick={() => props.onTriggerDisconnect()}
                        tabIndex={-1}
                    >
                        {syncProgress != null ? 'Cancel' : 'Disconnect'}
                    </button>
                ) : (
                    <button
                        className='px-3 py-1 ml-2 rounded bg-eos-grey-dark border-2 border-solid border-eos-grey-light disabled:opacity-50'
                        disabled={
                            !isHostValid ||
                            props.connectionState === 'connecting'
                        }
                        onClick={() => props.onTriggerConnect(host)}
                        tabIndex={-1}
                    >
                        {props.connectionState === 'connecting'
                            ? 'Connecting'
                            : 'Connect'}
                    </button>
                )}
            </div>
        </div>
    );
});

export default ConsoleConnection;
