import classNames from 'classnames';
import { Cue } from '../models/eos';

interface PlaybackStatusDisplayProps {
    active: Cue | null;
    disabled?: boolean;
    editing?: boolean;
    next?: Cue | null;
}

function PlaybackStatusDisplay({
    active,
    disabled = false,
    editing = false,
    next,
}: PlaybackStatusDisplayProps) {
    const activeCueBackgroundClassNames = classNames(
        'flex flex-col justify-center rounded text-black font-bold shrink-0 basis-32 pl-3',
        { 'bg-eos-yellow': !editing },
        { 'bg-purple-400': editing },
    );

    const activeCueTextClassNames = classNames(
        'self-center pl-3 text-ellipsis overflow-hidden whitespace-nowrap',
        { 'text-eos-yellow': !editing },
        { 'text-purple-400': editing },
    );

    const mainClassNames = classNames({ 'opacity-50': disabled });

    return (
        <div className={mainClassNames}>
            <div className='text-2xl h-10 flex align-items-center rounded bg-eos-grey-dark'>
                <div className={activeCueBackgroundClassNames}>
                    {active?.cueNumber}
                </div>
                <span className={activeCueTextClassNames}>{active?.label}</span>
            </div>
            {next !== undefined && (
                <div className='text-lg h-8 flex align-items-center pt-3 ml-3'>
                    <div className='flex flex-col justify-center rounded bg-black text-white font-bold shrink-0 basis-32 pl-3'>
                        {next?.cueNumber}
                    </div>
                    <div className='self-center text-eos-grey-light pl-3 text-ellipsis overflow-hidden whitespace-nowrap'>
                        {next?.label}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlaybackStatusDisplay;
