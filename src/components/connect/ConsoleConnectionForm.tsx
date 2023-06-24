import { KeyboardEvent, useEffect, useState } from 'react';
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
        <div className='space-y-4 md:space-y-6 w-full'>
            <h1 className='text-center text-xl font-bold leading-tight tracking-tight md:text-2xl text-white'>
                Connect to Eos
            </h1>
            <form className='space-y-4 md:space-y-6' action='#'>
                <div>
                    <input
                        type='text'
                        className='text-center sm:text-sm rounded  block w-full p-4 bg-gray-700 placeholder-gray-400 text-white'
                        placeholder='Console IP'
                        disabled={props.connectionState !== 'disconnected'}
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        onKeyDown={onKeyDown}
                    ></input>
                </div>
                <button
                    type='submit'
                    className='w-full text-white bg-orange-800 hover:bg-orange-600 focus:ring-4 focus:outline-none font-medium rounded text-sm p-4 text-center disabled:opacity-50'
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
