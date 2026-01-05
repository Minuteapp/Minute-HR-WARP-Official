
import { useIsMobile } from '@/hooks/use-device-type';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAbsenceDashboard from '@/components/absence/mobile/MobileAbsenceDashboard';

const MobileAbsencePage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isMobile) {
      navigate('/absence');
    }
  }, [isMobile, navigate]);

  if (!isMobile) {
    return null;
  }

  return <MobileAbsenceDashboard />;
};

export default MobileAbsencePage;
