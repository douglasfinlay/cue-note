import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';

interface NoteInputProps {
    disabled?: boolean;
    value?: string;
    onEnterPressed: () => void;
    onTextChanged: (text: string) => void;
}

function NoteInput({
    disabled = false,
    value = '',
    onEnterPressed,
    onTextChanged,
}: NoteInputProps) {
    const [text, setText] = useState(value);

    useEffect(() => {
        setText(value);
    }, [value]);

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onEnterPressed();
        }
    };

    const onTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;

        setText(newValue);
        onTextChanged(newValue);
    };

    return (
        <textarea
            className='h-full w-full px-3 py-2 text-2xl align-top rounded bg-black border border-solid border-eos-yellow resize-none disabled:opacity-50'
            disabled={disabled}
            placeholder='Type your note followed by enter...'
            value={text}
            onChange={onTextChange}
            onKeyDown={onKeyDown}
        ></textarea>
    );
}

export default NoteInput;
