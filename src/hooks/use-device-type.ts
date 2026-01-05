import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return deviceType;
}

export function useIsMobile() {
  const deviceType = useDeviceType();
  return deviceType === 'mobile';
}

export function useIsTablet() {
  const deviceType = useDeviceType();
  return deviceType === 'tablet';
}

export function useIsMobileOrTablet() {
  const deviceType = useDeviceType();
  return deviceType === 'mobile' || deviceType === 'tablet';
}