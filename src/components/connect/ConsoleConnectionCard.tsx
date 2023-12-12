import { EosConnectionState } from 'eos-console';
import ConsoleConnectionForm from './ConsoleConnectionForm';
import ConsoleSyncProgress from './ConsoleSyncProgress';

interface ConsoleConnectionCardProps {
    connectionState: EosConnectionState;
    syncProgress: number | null;

    onTriggerConnect: (address: string) => void;
    onTriggerDisconnect: () => void;
}

const ConsoleConnectionCard = (props: ConsoleConnectionCardProps) => {
    const showConnectionForm =
        props.connectionState === 'disconnected' ||
        props.connectionState === 'connecting';

    return (
        <div className='flex flex-col items-center justify-center mx-auto md:h-screen w-96'>
            <div className='w-full md:mt-0 sm:max-w-md xl:p-0'>
                {showConnectionForm ? (
                    <ConsoleConnectionForm
                        connectionState={props.connectionState}
                        onTriggerConnect={window.api.connectConsole}
                    />
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
