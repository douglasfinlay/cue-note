import classNames from 'classnames';
import { EtcDiscoveredDevice } from 'eos-console';

interface DiscoveredDeviceItemProps {
    device: EtcDiscoveredDevice;
    disabled?: boolean;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const DiscoveredDeviceItem = ({
    device,
    disabled,
    onClick,
}: DiscoveredDeviceItemProps) => {
    const containerClassNames = classNames(
        'h-16 p-2 flex justify-between items-center bg-gray-700 transition-all',
        {
            'hover:bg-gray-500 hover:cursor-pointer': !disabled,
        },
    );

    return (
        <div className={containerClassNames} onClick={onClick}>
            <div>{device.name}</div>
            <div className='text-right text-sm'>
                <div>{device.host}</div>
                <div className='italic'>{device.version}</div>
            </div>
        </div>
    );
};

export default DiscoveredDeviceItem;
