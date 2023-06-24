import { KeyboardEvent, useEffect, useState } from 'react';
import { ConnectionState } from '../models/eos';
import useLocalStorage from '../hooks/use-local-storage';

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

    const validate = () => {
        const valid =
            host.length <= 255 &&
            (HOSTNAME.test(host) ||
                IPV4_ADDRESS.test(host) ||
                IPV6_ADDRESS.test(host));

        setIsHostValid(valid);
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            props.onTriggerConnect(host);
        }
    };

    useEffect(() => validate(), [host]);

    useEffect(() => validate(), []);

    return (
        <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
            <h1 className='text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white'>
                Connect to Eos
            </h1>
            <form className='space-y-4 md:space-y-6' action='#'>
                <div>
                    <input
                        type='text'
                        className='text-center bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        placeholder='Console IP'
                        disabled={props.connectionState !== 'disconnected'}
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        onKeyDown={onKeyDown}
                    ></input>
                </div>
                <button
                    type='submit'
                    className='w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 disabled:opacity-50'
                    disabled={
                        !isHostValid || props.connectionState === 'connecting'
                    }
                    onClick={() => props.onTriggerConnect(host)}
                >
                    Connect
                </button>
            </form>
        </div>
    );
};

export default ConsoleConnectionForm;
