import QuickNoteButton from './QuickNoteButton';
import useLocalStorage from '../hooks/use-local-storage';

interface QuickNotesProps {
    buttonCount?: number;
    disabled?: boolean;
    onNoteTriggered: (note: string) => void;
}

function QuickNoteButtonGrid({
    buttonCount = 8,
    disabled = false,
    onNoteTriggered,
}: QuickNotesProps) {
    const [quickNotes, setQuickNotes] = useLocalStorage(
        'quickNotes',
        Array(buttonCount).fill(''),
    );

    const triggerNote = (index: number) => {
        const quickNote = quickNotes[index];

        if (quickNote) {
            onNoteTriggered(quickNote);
        }
    };

    const onNoteEdited = (index: number, newNote: string) => {
        setQuickNotes([
            ...quickNotes.slice(0, index),
            newNote,
            ...quickNotes.slice(index + 1),
        ]);
    };

    const buttons = quickNotes.map((note, index) => (
        <QuickNoteButton
            key={index}
            disabled={disabled}
            hotkeyIndex={index + 1}
            text={note}
            onTriggered={() => triggerNote(index)}
            onTextEdited={(newText) => onNoteEdited(index, newText)}
        />
    ));

    return <div className='h-full grid gap-4 grid-cols-2 grid-rows-4'>{buttons}</div>;
}

export default QuickNoteButtonGrid;
