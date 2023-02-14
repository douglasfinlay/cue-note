import { ChangeEvent, useState } from 'react';
import { ConnectionState } from '../../models/eos';

const HOSTNAME =
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/;
const IPV4_ADDRESS =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_ADDRESS = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/;

interface ConsoleConnectionProps {
    connectionState: ConnectionState;
    onTriggerConnect: (address: string) => void;
    onTriggerDisconnect: () => void;
}

function ConsoleConnection({
    connectionState,
    onTriggerConnect,
    onTriggerDisconnect,
}: ConsoleConnectionProps) {
    const [host, setHost] = useState('');
    const [isHostValid, setIsHostValid] = useState(false);

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

    return (
        <div className='flex'>
            <input
                type='text'
                className='flex-grow px-2 rounded bg-black border border-solid border-eos-yellow'
                placeholder='EOS Console IP Address'
                value={host}
                onChange={onHostChanged}
            ></input>

            {connectionState === 'connected' ? (
                <button
                    className='px-3 py-1 ml-2 rounded bg-eos-grey-dark border-2 border-solid border-eos-grey-light'
                    onClick={() => onTriggerDisconnect()}
                >
                    Disconnect
                </button>
            ) : (
                <button
                    className='px-3 py-1 ml-2 rounded bg-eos-grey-dark border-2 border-solid border-eos-grey-light disabled:opacity-50'
                    disabled={!isHostValid || connectionState === 'connecting'}
                    onClick={() => onTriggerConnect(host)}
                >
                    {connectionState === 'connecting'
                        ? 'Connecting'
                        : 'Connect'}
                </button>
            )}
        </div>
    );
}

export default ConsoleConnection;
