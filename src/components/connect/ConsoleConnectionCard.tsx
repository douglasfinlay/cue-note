import { EosConnectionState } from 'eos-console';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ConsoleDiscovery from './ConsoleDiscovery';
import ConsoleSyncProgress from './ConsoleSyncProgress';
import ManualConnectionForm from './ManualConnectionForm';

interface ConsoleConnectionCardProps {
    connectionState: EosConnectionState;
    syncProgress: number | null;

    onTriggerConnect: (address: string) => void;
    onTriggerDisconnect: () => void;
}

const ConsoleConnectionCard = (props: ConsoleConnectionCardProps) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [manualConnection, setManualConnection] = useState(false);

    const toggleManualConnection = () => {
        setManualConnection((prev) => !prev);
    };

    const connectConsole = (address: string) => {
        setIsConnecting(true);

        window.api
            .connectConsole(address)
            .catch((err) => {
                console.error(err);

                let message = 'Unknown error';

                if (err.message.includes('ECONNREFUSED')) {
                    message = 'Connection refused';
                } else if (err.message.includes('ENOTFOUND')) {
                    message = 'Address not found';
                } else if (err.message === 'timed out') {
                    message = 'Connection timed out';
                }

                toast.error(message);
            })
            .finally(() => {
                // Prevent spamming connection attempts
                setTimeout(() => {
                    setIsConnecting(false);
                }, 500);
            });
    };

    const showConnectionForm =
        props.connectionState === 'disconnected' ||
        props.connectionState === 'connecting';

    return (
        <div className='flex flex-col items-center justify-center mx-auto md:h-screen w-96'>
            <div className='max-h-64 w-full md:mt-0 sm:max-w-md xl:p-0'>
                {showConnectionForm ? (
                    <div className='text-center'>
                        {manualConnection ? (
                            <ManualConnectionForm
                                disabled={isConnecting}
                                onTriggerConnect={connectConsole}
                            />
                        ) : (
                            <ConsoleDiscovery
                                disabled={isConnecting}
                                onTriggerConnect={connectConsole}
                            />
                        )}

                        <button
                            type='button'
                            className='mt-3 text-md text-neutral-500 hover:text-neutral-200'
                            onClick={toggleManualConnection}
                        >
                            {manualConnection
                                ? 'Back to Console Discovery'
                                : 'Manual Connection'}
                        </button>
                    </div>
                ) : (
                    <ConsoleSyncProgress
                        progress={props.syncProgress}
                        onTriggerDisconnect={window.api.disconnectConsole}
                    />
                )}
            </div>
        </div>
    );
};

export default ConsoleConnectionCard;
