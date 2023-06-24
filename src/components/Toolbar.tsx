interface ToolbarProps {
    onTriggerDisconnect: () => void;
}

const Toolbar = ({ onTriggerDisconnect }: ToolbarProps) => {
    return (
        <nav className='bg-white border-gray-200 dark:bg-gray-900'>
            <div className='flex flex-wrap items-center justify-between mx-auto p-3'>
                <button
                    type='button'
                    className='inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
                    onClick={() => onTriggerDisconnect()}
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-6 h-6'
                        width='16'
                        height='16'
                        fill='currentColor'
                        viewBox='0 0 16 16'
                    >
                        <path
                            fillRule='evenodd'
                            d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'
                        />
                    </svg>
                </button>
            </div>
        </nav>
    );
};

export default Toolbar;
