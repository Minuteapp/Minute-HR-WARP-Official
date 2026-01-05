import React from 'react';
import { useDeviceType } from '@/hooks/use-device-type';
import MobileMehrPage from '@/components/mehr/mobile/MobileMehrPage';
import TabletMehrPage from '@/components/mehr/tablet/TabletMehrPage';
import DesktopMehrPage from '@/components/mehr/desktop/DesktopMehrPage';

const Mehr = () => {
  const deviceType = useDeviceType();
  
  if (deviceType === 'mobile') {
    return <MobileMehrPage />;
  }
  
  if (deviceType === 'tablet') {
    return <TabletMehrPage />;
  }
  
  return <DesktopMehrPage />;
};

export default Mehr;