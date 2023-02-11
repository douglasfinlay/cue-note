import { KeyboardEvent, useEffect, useState } from 'react';

interface NoteInputProps {
    note?: string;
    onNoteChanged: (note: string) => void;
}

function NoteInput({ note = '', onNoteChanged }: NoteInputProps) {
    const [text, setText] = useState(note);

    useEffect(() => {
        setText(note);
    }, [note]);

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            if (text.length) {
                onNoteChanged(text);
                setText('');
            }
        }
    };

    return (
        <textarea
            className='h-full w-full px-3 py-2 text-2xl align-top rounded bg-black border border-solid border-eos-yellow resize-none'
            placeholder='Type your note followed by enter...'
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
        ></textarea>
    );
}

export default NoteInput;
