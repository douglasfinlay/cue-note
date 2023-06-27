interface ToolbarProps {
    buttonPosition?: 'left' | 'right';
    onTriggerDisconnect?: () => void;
    title: string;
}

const TitleBar = ({
    buttonPosition = 'left',
    onTriggerDisconnect,
    title,
}: ToolbarProps) => {
    const buttons = onTriggerDisconnect ? (
        <button
            type='button'
            className='inline-flex items-center px-2 text-sm text-neutral-500 hover:text-neutral-200 app-region-no-drag'
            onClick={() => onTriggerDisconnect()}
        >
            Disconnect
        </button>
    ) : null;

    return (
        <nav className='flex items-center justify-between mx-auto h-full app-region-drag px-2'>
            <div className='grow shrink-0 basis-40'>
                {buttonPosition === 'left' && buttons}
            </div>
            <span className='text-center whitespace-nowrap truncate'>
                {title}
            </span>
            <span className='grow shrink-0 basis-40 inline-flex justify-end'>
                {buttonPosition === 'right' && buttons}
            </span>
        </nav>
    );
};

export default TitleBar;
