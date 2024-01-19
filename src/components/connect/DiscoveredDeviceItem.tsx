import { EtcDiscoveredDevice } from 'eos-console';

interface DiscoveredDeviceItemProps {
    device: EtcDiscoveredDevice;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const DiscoveredDeviceItem = ({
    device,
    onClick,
}: DiscoveredDeviceItemProps) => {
    return (
        <div
            className='h-16 p-2 flex justify-between items-center bg-gray-700 hover:bg-gray-500 hover:cursor-pointer transition-colors'
            onClick={onClick}
        >
            <div>{device.name}</div>
            <div className='text-right text-sm'>
                <div>{device.host}</div>
                <div className='italic'>{device.version}</div>
            </div>
        </div>
    );
};

export default DiscoveredDeviceItem;
