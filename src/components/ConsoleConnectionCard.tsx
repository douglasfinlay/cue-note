import { ConnectionState } from '../models/eos';
import ConsoleConnectionForm from './ConsoleConnectionForm';
import ConsoleSyncProgress from './ConsoleSyncProgress';

interface ConsoleConnectionCardProps {
    address?: string;
    connectionState: ConnectionState;
    initialSyncProgress?: number;

    onTriggerConnect: (address: string) => void;
    onTriggerDisconnect: () => void;
}

const ConsoleConnectionCard = (props: ConsoleConnectionCardProps) => {
    return (
        <div className='flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0'>
            <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700'>
                {props.initialSyncProgress === undefined ? (
                    <ConsoleConnectionForm
                        address={props.address}
                        connectionState={props.connectionState}
                        onTriggerConnect={window.api.connectConsole}
                    />
                ) : (
                    <ConsoleSyncProgress
                        progress={props.initialSyncProgress}
                        onTriggerDisconnect={window.api.disconnectConsole}
                    />
                )}
            </div>
        </div>
    );
};

export default ConsoleConnectionCard;
