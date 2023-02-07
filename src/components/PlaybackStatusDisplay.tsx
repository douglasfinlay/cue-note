import { Cue } from '../models/cue';

interface PlaybackStatusDisplayProps {
    current: Cue;
    next?: Cue;
}

function PlaybackStatusDisplay({ current, next }: PlaybackStatusDisplayProps) {
    return (
        <>
            <div className='text-2xl h-10 flex align-items-center rounded bg-eos-grey-dark'>
                <div className='flex flex-col justify-center rounded bg-eos-yellow text-black font-bold shrink-0 basis-32 pl-3'>
                    {current.number}
                </div>
                <span className='self-center text-eos-yellow pl-3 text-ellipsis overflow-hidden whitespace-nowrap'>
                    {current.label}
                </span>
            </div>
            {next && (
                <div className='text-lg h-8 flex align-items-center pt-3 ml-3'>
                    <div className='flex flex-col justify-center rounded bg-black text-white font-bold shrink-0 basis-32 pl-3'>
                        {next.number}
                    </div>
                    <div className='self-center text-eos-grey-light pl-3 text-ellipsis overflow-hidden whitespace-nowrap'>
                        {next.label}
                    </div>
                </div>
            )}
        </>
    );
}

export default PlaybackStatusDisplay;
