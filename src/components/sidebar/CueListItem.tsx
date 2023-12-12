import cx from 'classnames';
import { Cue } from '../../models/eos';

interface CueProps {
    cue: Cue;
    active?: boolean;
    editing?: boolean;
    onTriggerClear?: () => void;
    onTriggerEdit?: () => void;
    onTriggerGoTo?: () => void;
}

function CueListItem({
    cue,
    active,
    editing,
    onTriggerClear,
    onTriggerEdit,
    onTriggerGoTo,
}: CueProps) {
    const sceneMarkerStyle =
        'flex justify-center items-center space-evenly text-xs font-bold';

    const sceneMarkerLineStyle = 'h-1.5 bg-gray-400 my-2 grow';

    const itemStyle = cx('mb-2 w-full border-l-8', {
        'bg-neutral-900': !!cue.notes,
        'border-green-600 py-2': active,
        'border-slate-600': !!cue.notes && !active && !editing,
        'border-transparent': !cue.notes && !active && !editing,
        'border-purple-400': editing,
    });

    const cueLabelStyle = cx(
        'self-center pl-3 text-ellipsis overflow-hidden whitespace-nowrap grow',
        {
            'font-bold text-neutral-300': active,
            'text-zinc-400': !active && !editing,
            'text-purple-400': editing,
        },
    );

    const cueNumberStyle = cx(
        'flex flex-col justify-center font-bold shrink-0 basis-24 pl-2',
        {
            'text-neutral-300': active,
            'text-zinc-400': !active && !editing,
            'text-purple-400': editing,
        },
    );

    return (
        <div className='text-gray-200 flex flex-col'>
            {cue.scene && (
                <div className={sceneMarkerStyle}>
                    <div className={sceneMarkerLineStyle}></div>
                    <div className='px-2 overflow-x-hidden whitespace-nowrap text-ellipsis'>
                        {cue.scene}
                    </div>
                    <div className={sceneMarkerLineStyle}></div>
                </div>
            )}

            <div className={itemStyle}>
                <div className='h-6 flex align-items-center'>
                    <div className={cueNumberStyle}>
                        {cue.isPart ? `P${cue.cuePartNumber}` : cue.cueNumber}
                    </div>
                    <div className={cueLabelStyle}>{cue.label}</div>
                    <div className='flex gap-2 grow-0 shrink-0'>
                        {onTriggerEdit && (
                            <button onClick={onTriggerEdit} tabIndex={-1}>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    fill='currentColor'
                                    className='bi bi-pencil-fill fill-none hover:stroke-gray-200 stroke-gray-500'
                                    viewBox='0 0 16 16'
                                >
                                    <path d='M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z' />
                                </svg>
                            </button>
                        )}

                        {onTriggerClear && (
                            <button onClick={onTriggerClear} tabIndex={-1}>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    fill='currentColor'
                                    className='bi bi-eraser-fill fill-none hover:stroke-gray-200 stroke-gray-500'
                                    viewBox='0 0 16 16'
                                >
                                    <path d='M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z' />
                                </svg>
                            </button>
                        )}

                        {onTriggerGoTo && (
                            <button onClick={onTriggerGoTo} tabIndex={-1}>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    fill='currentColor'
                                    className='bi bi-play-fill fill-none hover:fill-green-400 stroke-gray-200'
                                    viewBox='0 0 16 16'
                                >
                                    <path d='m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z' />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {cue.notes && (
                    <div className='py-1 px-2 break-all text-neutral-300'>{cue.notes}</div>
                )}
            </div>

            {cue.isSceneEnd && <div className={sceneMarkerLineStyle}></div>}
        </div>
    );
}

export default CueListItem;
