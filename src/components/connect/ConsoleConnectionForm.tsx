import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { ConnectionState } from '../../models/eos';
import useLocalStorage from '../../hooks/use-local-storage';

const HOSTNAME =
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$/;
const IPV4_ADDRESS =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_ADDRESS = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/;

interface ConsoleConnectionProps {
    connectionState: ConnectionState;
    onTriggerConnect: (address: string) => void;
}

const ConsoleConnectionForm = (props: ConsoleConnectionProps) => {
    const [host, setHost] = useLocalStorage('host', '');
    const [isHostValid, setIsHostValid] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const hostInput = useRef<HTMLInputElement>(null);

    const onConnectError = (reason: string) => {
        let message = 'Unknown error';

        if (reason.includes('ECONNREFUSED')) {
            message = 'Connection refused';
        } else if (reason.includes('ENOTFOUND')) {
            message = 'Address not found';
        } else if (reason === 'timed out') {
            message = 'Connection timed out'
        }

        setErrorMessage(message);
    };

    const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        window.requestAnimationFrame(() => {
            setErrorMessage(null);
        });

        props.onTriggerConnect(host);
    };

    const onHostInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setHost(e.target.value);
        setErrorMessage(null);
    }

    const validate = () => {
        const valid =
            host.length <= 255 &&
            (HOSTNAME.test(host) ||
                IPV4_ADDRESS.test(host) ||
                IPV6_ADDRESS.test(host));

        setIsHostValid(valid);
    };

    useEffect(() => {
        // If we've just shown the user an error, ensure the input field is
        // selected and focussed to allow for a quick edit
        if (errorMessage) {
            hostInput.current?.select();
        }
    });

    useEffect(() => {
        hostInput.current?.select();

        // Ensure the connect button is in the correct state from the start
        validate();

        const removeConnectErrorListener =
            window.api.onConnectError(onConnectError);

        return removeConnectErrorListener;
    }, []);

    useEffect(validate, [host]);

    return (
        <div className='space-y-4 md:space-y-6 w-full relative'>
            <form className='space-y-4 md:space-y-6' onSubmit={onFormSubmit}>
                <div>
                    <input
                        ref={hostInput}
                        type='text'
                        className='text-center sm:text-sm rounded  block w-full p-4 bg-gray-700 placeholder-gray-400 text-white'
                        placeholder='Console IP'
                        disabled={props.connectionState !== 'disconnected'}
                        value={host}
                        onChange={onHostInputChange}
                    />
                </div>

                <button
                    type='submit'
                    className='w-full text-white bg-orange-800 hover:bg-orange-600 focus:ring-4 focus:outline-none font-medium rounded text-sm p-4 text-center disabled:opacity-50'
                    disabled={
                        !isHostValid || props.connectionState === 'connecting'
                    }
                >
                    {props.connectionState === 'connecting'
                        ?
                        <>
                            <svg className="inline w-4 h-4 mr-3 text-white animate-spin fill-black" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                            </svg>
                            Connecting...
                        </>
                        : 'Connect'
                    }
                </button>
            </form>

            {errorMessage && (
                <div className='text-center absolute w-full'>
                    <div
                        className='p-2 items-center leading-none rounded flex justify-center'
                        role='alert'
                    >
                        <span className='flex rounded border-2 border-red-500 text-red-500 uppercase px-2 py-1 text-xs font-bold mr-3'>
                            Error
                        </span>
                        <span className='text-red-500 font-semibold text-left'>
                            {errorMessage}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsoleConnectionForm;
