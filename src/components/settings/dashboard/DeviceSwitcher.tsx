import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceSwitcherProps {
  activeDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
}

const devices: { id: DeviceType; icon: React.ReactNode; label: string }[] = [
  { id: 'desktop', icon: <Monitor className="h-4 w-4" />, label: 'Desktop' },
  { id: 'tablet', icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
  { id: 'mobile', icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
];

export const DeviceSwitcher: React.FC<DeviceSwitcherProps> = ({
  activeDevice,
  onDeviceChange,
}) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      {devices.map((device) => (
        <Button
          key={device.id}
          variant={activeDevice === device.id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onDeviceChange(device.id)}
          className={cn(
            'flex items-center gap-2 transition-all',
            activeDevice === device.id && 'shadow-sm'
          )}
        >
          {device.icon}
          <span className="hidden sm:inline">{device.label}</span>
        </Button>
      ))}
    </div>
  );
};
