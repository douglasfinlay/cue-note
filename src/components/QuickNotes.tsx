function QuickNotes() {
    const buttons = [];

    for (let i = 0; i < 8; i++) {
        buttons.push(
            <button key={i} className='rounded bg-eos-grey-dark'>
                Quick Note #{i + 1}
            </button>,
        );
    }

    return <div className='grid h-full gap-4 grid-cols-2'>{buttons}</div>;
}

export default QuickNotes;
