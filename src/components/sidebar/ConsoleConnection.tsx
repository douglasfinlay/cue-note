import { useState } from 'react';
import { ConnectionState } from '../../models/eos';

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
    const [address, setAddress] = useState('');

    return (
        <div className='flex'>
            <input
                type='text'
                className='flex-grow px-2 rounded bg-black border border-solid border-eos-yellow'
                placeholder='EOS Console IP Address'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
                    className='px-3 py-1 ml-2 rounded bg-eos-grey-dark border-2 border-solid border-eos-grey-light'
                    disabled={
                        !address.length || connectionState === 'connecting'
                    }
                    onClick={() => onTriggerConnect(address)}
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
