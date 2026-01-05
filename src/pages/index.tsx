import { useDeviceType } from '@/hooks/use-device-type';
import { useUserRole } from '@/hooks/useUserRole';
import MobileDashboardPage from '@/pages/mobile-dashboard';
import TabletDashboard from '@/components/dashboard/tablet/TabletDashboard';
import DesktopDashboard from '@/components/dashboard/desktop/DesktopDashboard';
import EmployeeDesktopDashboard from '@/components/dashboard/desktop/EmployeeDesktopDashboard';

const Index = () => {
  const deviceType = useDeviceType();
  const { isEmployee, isHRAdmin, isLoading } = useUserRole();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mobile: Zeige DIREKT das mobile Dashboard
  if (deviceType === 'mobile') {
    return <MobileDashboardPage />;
  }

  if (deviceType === 'tablet') {
    return <TabletDashboard />;
  }

  // Desktop - Mitarbeiter-Rolle (nicht Admin/HR): Zeige Mitarbeiter-Dashboard
  if (isEmployee && !isHRAdmin) {
    return <EmployeeDesktopDashboard />;
  }

  return <DesktopDashboard />;
};

export default Index;
