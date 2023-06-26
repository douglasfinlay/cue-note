import {
    ChangeEvent,
    forwardRef,
    KeyboardEvent,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

interface NoteInputProps {
    disabled?: boolean;
    value?: string;
    onEnterPressed: () => void;
    onTextChanged: (text: string) => void;
}

export interface NoteInputHandle {
    focus: () => void;
}

const NoteInput = forwardRef<NoteInputHandle, NoteInputProps>((props, ref) => {
    const [text, setText] = useState(props.value);
    const refTextArea = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => {
        return {
            focus() {
                refTextArea.current?.focus();
            },
        };
    });

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            props.onEnterPressed();
        }
    };

    const onTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;

        setText(newValue);
        props.onTextChanged(newValue);
    };

    useEffect(() => {
        setText(props.value);
    }, [props.value]);

    return (
        <textarea
            ref={refTextArea}
            className='h-full w-full px-3 py-2 text-xl align-top resize-none disabled:opacity:50 bg-gray-700 placeholder-gray-400 text-white'
            disabled={props.disabled}
            placeholder='Type your note followed by enter...'
            value={text}
            onChange={onTextChange}
            onKeyDown={onKeyDown}
        ></textarea>
    );
});

export default NoteInput;
