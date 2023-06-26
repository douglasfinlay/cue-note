import cx from 'classnames';
import {
    ChangeEvent,
    KeyboardEvent,
    FocusEvent,
    useEffect,
    useState,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface QuickNoteButtonProps {
    disabled?: boolean;
    hotkeyIndex?: number;
    onTextEdited?: (newText: string) => void;
    onTriggered: () => void;
    text: string;
}

function QuickNoteButton({
    disabled = false,
    hotkeyIndex,
    onTextEdited,
    onTriggered,
    text: initialText,
}: QuickNoteButtonProps) {
    const [isAnimating, setAnimating] = useState(false);

    const isMac = navigator.platform.includes('Mac');
    const modifierKey = isMac ? 'meta' : 'ctrl';

    const trigger = () => {
        if (!disabled && !isEditing && text.length) {
            setAnimating(true);
            onTriggered();
        }
    };

    useHotkeys(`${modifierKey}+${hotkeyIndex}`, trigger, {
        enableOnFormTags: true,
        preventDefault: true,
    });

    const [isEditing, setEditing] = useState(false);

    const onButtonBlur = (e: FocusEvent<HTMLButtonElement>) => {
        const currentTarget = e.currentTarget;

        requestAnimationFrame(() => {
            if (!currentTarget.contains(document.activeElement)) {
                setEditing(false);
            }
        });
    };

    const [text, setText] = useState(initialText);

    const finishEditing = (newText: string) => {
        if (newText !== oldText) {
            onTextEdited?.(newText);
        }

        setEditing(false);
    };

    const [oldText, setOldText] = useState<string | null>(null);

    useEffect(() => {
        if (isEditing) {
            setOldText(text);
        }
    }, [isEditing]);

    useEffect(() => {
        setText(initialText);
    }, [initialText]);

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
    };

    const onInputFocus = (e: FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            if (isEditing) {
                finishEditing(e.currentTarget.value);
            }
        }
    };

    const onButtonContextMenu = () => {
        // Only enter edit mode if there is an `onTextEdited` callback attached
        if (onTextEdited) {
            setEditing(true);
        }
    };

    const buttonClasses = cx(
        'relative bg-neutral-900 disabled:opacity-50',
        {
            'animate-quick-button-trigger': isAnimating,
            'hover:bg-gray-700': !disabled && text.length,
        },
    );

    return (
        <button
            className={buttonClasses}
            disabled={disabled || !text.length}
            onClick={trigger}
            onContextMenu={onButtonContextMenu}
            onBlur={onButtonBlur}
            onAnimationEnd={() => setAnimating(false)}
            tabIndex={-1}
        >
            {hotkeyIndex !== undefined && (
                <div className='flex bottom-1 left-2 items-center absolute text-gray-500 text-3xl opacity-20'>
                    {isMac ? (
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='currentColor'
                            className='bi bi-command stroke-gray-500 w-6 h-6'
                            viewBox='0 0 16 16'
                        >
                            <path d='M3.5 2A1.5 1.5 0 0 1 5 3.5V5H3.5a1.5 1.5 0 1 1 0-3zM6 5V3.5A2.5 2.5 0 1 0 3.5 6H5v4H3.5A2.5 2.5 0 1 0 6 12.5V11h4v1.5a2.5 2.5 0 1 0 2.5-2.5H11V6h1.5A2.5 2.5 0 1 0 10 3.5V5H6zm4 1v4H6V6h4zm1-1V3.5A1.5 1.5 0 1 1 12.5 5H11zm0 6h1.5a1.5 1.5 0 1 1-1.5 1.5V11zm-6 0v1.5A1.5 1.5 0 1 1 3.5 11H5z' />
                        </svg>
                    ) : (
                        'Ctrl+'
                    )}
                    {hotkeyIndex}
                </div>
            )}
            {isEditing ? (
                <input
                    type='text'
                    className='text-center inline-block h-full w-full bg-red-800 placeholder-gray-400 text-white'
                    placeholder='My quick note'
                    value={text}
                    onChange={onInputChange}
                    onFocus={onInputFocus}
                    onKeyDown={onInputKeyDown}
                    autoFocus
                />
            ) : (
                <>
                    {text || (
                        <span className='text-gray-500'>
                            Right-click to set note
                        </span>
                    )}
                </>
            )}
        </button>
    );
}

export default QuickNoteButton;
