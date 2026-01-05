
import { useIsMobile } from '@/hooks/use-device-type';
import MobileTimeView from '@/components/time/mobile/MobileTimeView';
import { Navigate } from 'react-router-dom';

const MobileTimePage = () => {
  const isMobile = useIsMobile();
  
  if (!isMobile) {
    return <Navigate to="/time" replace />;
  }

  return <MobileTimeView />;
};

export default MobileTimePage;
