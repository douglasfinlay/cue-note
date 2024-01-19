import classNames from 'classnames';
import { useEffect } from 'react';
import toast, {
    Toast,
    Toaster,
    resolveValue,
    useToasterStore,
} from 'react-hot-toast';

const TOAST_LIMIT = 2;

const AppToaster = () => {
    const { toasts } = useToasterStore();

    // Limit the number of visible toasts
    useEffect(() => {
        toasts
            .filter((t) => t.visible)
            .filter((_, i) => i >= TOAST_LIMIT)
            .forEach((t) => toast.dismiss(t.id));
    }, [toasts]);

    const renderToast = (t: Toast) => {
        const containerClassName = classNames(
            'flex items-center justify-between border-2 text-md font-bold pr-3',
            {
                'opacity-0': !t.visible,
                'border-red-500 text-red-500': t.type === 'error',
            },
        );

        return (
            <div className={containerClassName}>
                {t.type === 'error' && (
                    <span className='flex fill-red-500 py-2 pl-2 pr-3'>
                        {t.icon}
                    </span>
                )}
                <span>{resolveValue(t.message, t)}</span>
            </div>
        );
    };

    return (
        <Toaster
            position='bottom-center'
            containerClassName='mb-2'
            toastOptions={{
                error: {
                    icon: (
                        <svg
                            className='w-7 h-7'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='currentColor'
                            viewBox='0 0 16 16'
                        >
                            <path d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2' />
                        </svg>
                    ),
                },
            }}
        >
            {renderToast}
        </Toaster>
    );
};

export default AppToaster;
