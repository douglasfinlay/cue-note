import { EtcDiscoveredDevice } from 'eos-console';
import { useEffect, useState } from 'react';
import { RemoveEventListenerFunc } from '../../preload';
import DiscoveredDeviceItem from './DiscoveredDeviceItem';
import DiscoveredDeviceSearchingItem from './DiscoveredDeviceSearchingItem';

interface ConsoleConnectionProps {
    disabled?: boolean;
    onTriggerConnect: (address: string) => void;
}

const ConsoleDiscovery = (props: ConsoleConnectionProps) => {
    const [devices, setDevices] = useState<EtcDiscoveredDevice[]>([]);

    const connect = (device: EtcDiscoveredDevice) => {
        props.onTriggerConnect(device.host);
    };

    useEffect(() => {
        const eventListeners: RemoveEventListenerFunc[] = [];

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
                disabled={props.disabled}
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
        </div>
    );
};

export default ConsoleDiscovery;
