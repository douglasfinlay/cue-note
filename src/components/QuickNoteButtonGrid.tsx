interface QuickNotesProps {
    disabled?: boolean;
    quickNotes: string[];
    onNoteTriggered: (note: string) => void;
}

function QuickNoteButtonGrid({
    disabled = false,
    quickNotes,
    onNoteTriggered,
}: QuickNotesProps) {
    if (quickNotes.length !== 8) {
        throw new Error('Quick notes must have length 8');
    }

    const triggerNote = (index: number) => {
        const quickNote = quickNotes[index];

        if (quickNote) {
            onNoteTriggered(quickNote);
        }
    };

    const buttons = quickNotes.map((note, index) => (
        <button
            key={index}
            className='relative rounded bg-eos-grey-dark disabled:opacity-50'
            disabled={disabled}
            onClick={() => triggerNote(index)}
        >
            <div className='flex bottom-1 left-2 items-center absolute text-eos-grey-light text-3xl opacity-20'>
                {navigator.platform.includes('Mac') ? (
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='currentColor'
                        className='bi bi-command stroke-eos-grey-light w-6 h-6'
                        viewBox='0 0 16 16'
                    >
                        <path d='M3.5 2A1.5 1.5 0 0 1 5 3.5V5H3.5a1.5 1.5 0 1 1 0-3zM6 5V3.5A2.5 2.5 0 1 0 3.5 6H5v4H3.5A2.5 2.5 0 1 0 6 12.5V11h4v1.5a2.5 2.5 0 1 0 2.5-2.5H11V6h1.5A2.5 2.5 0 1 0 10 3.5V5H6zm4 1v4H6V6h4zm1-1V3.5A1.5 1.5 0 1 1 12.5 5H11zm0 6h1.5a1.5 1.5 0 1 1-1.5 1.5V11zm-6 0v1.5A1.5 1.5 0 1 1 3.5 11H5z' />
                    </svg>
                ) : (
                    'Ctrl+'
                )}
                {index + 1}
            </div>
            {note}
        </button>
    ));

    return <div className='grid h-full gap-4 grid-cols-2'>{buttons}</div>;
}

export default QuickNoteButtonGrid;
