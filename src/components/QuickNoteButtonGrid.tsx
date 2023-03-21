import QuickNoteButton from './QuickNoteButton';

interface QuickNotesProps {
    buttonCount?: number;
    disabled?: boolean;
    quickNotes: string[];
    onNoteTriggered: (note: string) => void;
}

function QuickNoteButtonGrid({
    buttonCount = 8,
    disabled = false,
    quickNotes,
    onNoteTriggered,
}: QuickNotesProps) {
    if (quickNotes.length < 8) {
        for (let i = 0; i < buttonCount - quickNotes.length; i++) {
            quickNotes.push('');
        }
    } else if (quickNotes.length > 8) {
        console.warn(
            'Too many notes passed to QuickNoteButtonGrid, extras will be ignored',
        );
        quickNotes = quickNotes.slice(0, 8);
    }

    const triggerNote = (index: number) => {
        const quickNote = quickNotes[index];

        if (quickNote) {
            onNoteTriggered(quickNote);
        }
    };

    const buttons = quickNotes.map((note, index) => (
        <QuickNoteButton
            key={index}
            disabled={disabled}
            hotkeyIndex={index + 1}
            text={note}
            onTriggered={() => triggerNote(index)}
        />
    ));

    return <div className='grid h-full gap-4 grid-cols-2'>{buttons}</div>;
}

export default QuickNoteButtonGrid;
