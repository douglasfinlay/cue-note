import { Cue } from '../models/eos';

interface PlaybackStatusDisplayProps {
    active: Cue | null;
    next: Cue | null;
}

function PlaybackStatusDisplay({ active, next }: PlaybackStatusDisplayProps) {
    return (
        <>
            <div className='text-2xl h-10 flex align-items-center rounded bg-eos-grey-dark'>
                <div className='flex flex-col justify-center rounded bg-eos-yellow text-black font-bold shrink-0 basis-32 pl-3'>
                    {active?.cueNumber}
                </div>
                <span className='self-center text-eos-yellow pl-3 text-ellipsis overflow-hidden whitespace-nowrap'>
                    {active?.label}
                </span>
            </div>
            <div className='text-lg h-8 flex align-items-center pt-3 ml-3'>
                <div className='flex flex-col justify-center rounded bg-black text-white font-bold shrink-0 basis-32 pl-3'>
                    {next?.cueNumber}
                </div>
                <div className='self-center text-eos-grey-light pl-3 text-ellipsis overflow-hidden whitespace-nowrap'>
                    {next?.label}
                </div>
            </div>
        </>
    );
}

export default PlaybackStatusDisplay;
