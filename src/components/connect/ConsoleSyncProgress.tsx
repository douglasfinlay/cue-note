import { useEffect, useState } from 'react';

interface ConsoleSyncProgressProps {
    progress?: number;
    onTriggerDisconnect: () => void;
}

const ConsoleSyncProgress = (props: ConsoleSyncProgressProps) => {
    const [syncProgress, setSyncProgress] = useState<number | null>(null);

    useEffect(() => {
        let progress = props.progress;

        if (progress === undefined) {
            setSyncProgress(null);
            return;
        }

        progress = progress * 100;
        progress = Math.min(Math.max(progress, 0), 100);
        setSyncProgress(progress);
    }, [props.progress]);

    return (
        <div className='space-y-4 md:space-y-6 w-full'>
            <h1 className='text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white'>
                Syncing Cues...
            </h1>
            <div className='space-y-4 md:space-y-6'>
                <div className='w-full border border-eos-grey-light rounded h-2.5'>
                    <div
                        className='bg-eos-grey-light h-full rounded'
                        style={{ width: `${syncProgress}%` }}
                    ></div>
                </div>

                <button
                    className='w-full text-white bg-orange-800 hover:bg-orange-600 focus:ring-4 focus:outline-none font-medium rounded text-sm p-4 text-center disabled:opacity-50'
                    onClick={() => props.onTriggerDisconnect()}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ConsoleSyncProgress;
