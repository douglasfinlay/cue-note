import { CueList, TargetNumber } from 'eos-console';
import { useSelect } from 'downshift';
import classNames from 'classnames';

interface CueListSelectProps {
    cueLists: CueList[];
    onCueListSelected?: (cueListNumber: TargetNumber) => void;
}

function CueListSelect({ cueLists, onCueListSelected }: CueListSelectProps) {
    const {
        getItemProps,
        getLabelProps,
        getMenuProps,
        getToggleButtonProps,
        highlightedIndex,
        isOpen,
        selectedItem,
    } = useSelect<CueList>({
        items: cueLists,
        itemToString: (cueList) =>
            cueList ? `[${cueList.targetNumber}] ${cueList.label}` : '',
        onSelectedItemChange: ({ selectedItem }) => {
            if (selectedItem) {
                onCueListSelected?.(selectedItem.targetNumber);
            }
        },
    });

    const renderItem = (item: CueList) => (
        <div className='flex gap-4' {...getLabelProps()}>
            <div className='shrink-0'>{item.targetNumber}</div>
            <div className='grow whitespace-nowrap text-ellipsis overflow-hidden'>
                {item.label}
            </div>
        </div>
    );

    return (
        <div className='w-full h-full relative'>
            <div className='w-full h-full flex flex-col gap-1'>
                <div
                    className='p-2 flex justify-between items-center gap-2 cursor-pointer'
                    {...getToggleButtonProps()}
                >
                    {selectedItem ? (
                        renderItem(selectedItem)
                    ) : (
                        <div>Select a cue list</div>
                    )}
                    <span>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            fill='currentColor'
                            className='bi bi-chevron-expand'
                            viewBox='0 0 16 16'
                        >
                            <path
                                fillRule='evenodd'
                                d='M3.646 9.146a.5.5 0 0 1 .708 0L8 12.793l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708m0-2.292a.5.5 0 0 0 .708 0L8 3.207l3.646 3.647a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 0 0 0 .708'
                            />
                        </svg>
                    </span>
                </div>
            </div>

            <ul
                className={`absolute w-full max-h-96 overflow-scroll p-0 z-10 bottom-10 ${
                    !isOpen && 'hidden'
                }`}
                {...getMenuProps()}
            >
                {isOpen &&
                    cueLists.map((item, index) => (
                        <li
                            className={classNames('py-2 px-3 flex flex-col', {
                                'bg-neutral-800': highlightedIndex !== index,
                                'bg-blue-400': highlightedIndex === index,
                                'font-bold': selectedItem === item,
                            })}
                            key={item.targetNumber}
                            {...getItemProps({ item, index })}
                        >
                            {renderItem(item)}
                        </li>
                    ))}
            </ul>
        </div>
    );
}

export default CueListSelect;
