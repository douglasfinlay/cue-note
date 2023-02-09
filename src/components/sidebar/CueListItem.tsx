import cx from 'classnames';
import { Cue } from '../../models/eos';

interface CueProps {
    cue: Cue;
    current?: boolean;
}

function CueListItem({ cue, current }: CueProps) {
    const bgStyle = cx('mb-2 rounded text-eos-grey-light', {
        'bg-eos-grey-dark': !!cue.notes,
    });

    const cueLabelStyle = cx(
        'self-center pl-3 text-ellipsis overflow-hidden whitespace-nowrap grow',
        { 'text-eos-yellow': current },
        { 'text-eos-grey-light': !current },
    );

    const cueNumberStyle = cx(
        'flex flex-col justify-center rounded font-bold shrink-0 basis-24 pl-3',
        { 'bg-eos-yellow': current, 'text-black': current },
        { 'text-white': !current },
    );

    return (
        <div className={bgStyle}>
            <div className='h-6 flex align-items-center'>
                <div className={cueNumberStyle}>{cue.cueNumber}</div>
                <div className={cueLabelStyle}>{cue.label}</div>
                <div className='flex gap-2 grow-0 shrink-0'>
                    {/* edit note */}
                    <button>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            fill='currentColor'
                            className='bi bi-pencil'
                            viewBox='0 0 16 16'
                        >
                            <path d='M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z' />
                        </svg>
                    </button>

                    {/* clear note */}
                    <button>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            fill='currentColor'
                            className='bi bi-eraser'
                            viewBox='0 0 16 16'
                        >
                            <path d='M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414l-3.879-3.879zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z' />
                        </svg>
                    </button>

                    {/* go to cue */}
                    <button>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            fill='currentColor'
                            className='bi bi-play'
                            viewBox='0 0 16 16'
                        >
                            <path d='M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z' />
                        </svg>
                    </button>
                </div>
            </div>

            {cue.notes && <div className='py-1 px-2'>{cue.notes}</div>}
        </div>
    );
}

export default CueListItem;
