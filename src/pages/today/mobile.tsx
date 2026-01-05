
import { useIsMobile } from '@/hooks/use-device-type';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileTodayDashboard from '@/components/today/mobile/MobileTodayDashboard';

const MobileTodayPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isMobile) {
      navigate('/today');
    }
  }, [isMobile, navigate]);

  if (!isMobile) {
    return null;
  }

  return <MobileTodayDashboard />;
};

export default MobileTodayPage;
