import { EosConnectionState } from 'eos-console';
import ConsoleDiscovery from './ConsoleDiscovery';
import ConsoleSyncProgress from './ConsoleSyncProgress';
import { useState } from 'react';
import ManualConnectionForm from './ManualConnectionForm';

interface ConsoleConnectionCardProps {
    connectionState: EosConnectionState;
    syncProgress: number | null;

    onTriggerConnect: (address: string) => void;
    onTriggerDisconnect: () => void;
}

const ConsoleConnectionCard = (props: ConsoleConnectionCardProps) => {
    const [manualConnection, setManualConnection] = useState(false);

    const toggleManualConnection = () => {
        setManualConnection((prev) => !prev);
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
                                connectionState={props.connectionState}
                                onTriggerConnect={window.api.connectConsole}
                            />
                        ) : (
                            <ConsoleDiscovery
                                connectionState={props.connectionState}
                                onTriggerConnect={window.api.connectConsole}
                            />
                        )}

                        <button
                            type='button'
                            className='mt-3 text-md text-neutral-500 hover:text-neutral-200'
                            onClick={toggleManualConnection}
                        >
                            {manualConnection ? 'Back to Discovered Consoles' : 'Manual Connection'}
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
