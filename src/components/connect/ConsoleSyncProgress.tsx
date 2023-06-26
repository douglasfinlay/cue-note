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
            <div className='space-y-4 md:space-y-6'>
                <div className='text-center sm:text-sm block w-full p-4 bg-gray-700 placeholder-gray-400 text-white relative'>
                    &nbsp;
                    <div
                        className='absolute top-0 left-0 bg-gray-500 h-full'
                        style={{ width: `${syncProgress}%` }}
                    ></div>
                    <div className='absolute top-0 left-0 h-full w-full flex items-center justify-center'>
                        Syncing cues{syncProgress !== null && ` (${syncProgress.toFixed(0)}%)`}...
                    </div>
                </div>

                <button
                    className='w-full text-white bg-orange-800 hover:bg-orange-600 focus:ring-4 focus:outline-none font-medium text-sm p-4 text-center disabled:opacity-50'
                    onClick={() => props.onTriggerDisconnect()}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ConsoleSyncProgress;
