import { EosConnectionState, EtcDiscoveredDevice } from 'eos-console';
import { useEffect, useState } from 'react';
import { RemoveEventListenerFunc } from '../../preload';
import DiscoveredDeviceItem from './DiscoveredDeviceItem';
import DiscoveredDeviceSearchingItem from './DiscoveredDeviceSearchingItem';

interface ConsoleConnectionProps {
    connectionState: EosConnectionState;
    onTriggerConnect: (address: string) => void;
}

const ConsoleDiscovery = (props: ConsoleConnectionProps) => {
    const [devices, setDevices] = useState<EtcDiscoveredDevice[]>([
        // {
        //     host: '127.0.0.1',
        //     name: 'Mac (ETCnomad)',
        //     port: 3032,
        //     uid: '9ba95317-0e8e-495c-aa7a-43cfbcfb7898',
        //     version: '3.2.5.13',
        // },
        // {
        //     host: '10.0.7.168',
        //     name: 'Mac (ETCnomad)',
        //     port: 3032,
        //     uid: '9ba95317-0e8e-495c-aa7a-43cfbcfb7898',
        //     version: '3.2.5.13',
        // },
        // {
        //     host: '127.0.0.2',
        //     name: 'Mac (ETCnomad)',
        //     port: 3032,
        //     uid: '9ba95317-0e8e-495c-aa7a-43cfbcfb7899',
        //     version: '3.2.5.13',
        // },
        // {
        //     host: '10.0.7.169',
        //     name: 'Mac (ETCnomad)',
        //     port: 3032,
        //     uid: '9ba95317-0e8e-495c-aa7a-43cfbcfb7899',
        //     version: '3.2.5.13',
        // },
    ]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const onConnectError = (reason: string) => {
        let message = 'Unknown error';

        if (reason.includes('ECONNREFUSED')) {
            message = 'Connection refused';
        } else if (reason.includes('ENOTFOUND')) {
            message = 'Address not found';
        } else if (reason === 'timed out') {
            message = 'Connection timed out';
        }

        setErrorMessage(message);
    };

    const connect = (device: EtcDiscoveredDevice) => {
        props.onTriggerConnect(device.host);
    };

    // const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();

    //     window.requestAnimationFrame(() => {
    //         setErrorMessage(null);
    //     });

    //     props.onTriggerConnect(host);
    // };

    useEffect(() => {
        console.log(devices);
    }, [devices]);

    useEffect(() => {
        const eventListeners: RemoveEventListenerFunc[] = [];

        eventListeners.push(window.api.onConnectError(onConnectError));
        eventListeners.push(window.api.onDiscoveredDevicesChanged(setDevices));

        window.api.startDiscovery();

        return () => {
            window.api.stopDiscovery();

            for (const removeListener of eventListeners) {
                removeListener();
            }
        };
    }, []);

    const renderDeviceItem = (device: EtcDiscoveredDevice) => {
        const deviceKey = `${device.uid}_${device.host}`;

        return (
            <DiscoveredDeviceItem
                key={deviceKey}
                device={device}
                onClick={() => connect(device)}
            />
        );
    };

    return (
        <div className='w-full flex flex-col'>
            <div className='relative flex-1 overflow-y-auto'>
                {devices.length > 0 ? (
                    devices.map(renderDeviceItem)
                ) : (
                    <DiscoveredDeviceSearchingItem />
                )}
            </div>

            {errorMessage && (
                <div className='text-center absolute w-full'>
                    <div
                        className='p-2 items-center leading-none flex justify-center'
                        role='alert'
                    >
                        <span className='flex border-2 border-red-500 text-red-500 uppercase px-2 py-1 text-xs font-bold mr-3'>
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

export default ConsoleDiscovery;
