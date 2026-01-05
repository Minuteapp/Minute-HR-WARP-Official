import React from 'react';
import { MobileDashboard } from '@/components/dashboard/MobileDashboard';
import TabletDashboard from '@/components/dashboard/tablet/TabletDashboard';
import DesktopDashboard from '@/components/dashboard/desktop/DesktopDashboard';
import EmployeeDesktopDashboard from '@/components/dashboard/desktop/EmployeeDesktopDashboard';
import { useDeviceType } from '@/hooks/use-device-type';
import { useUserRole } from '@/hooks/useUserRole';

const Dashboard: React.FC = () => {
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
  
  // Mobile (< 768px): Zeige Mobile Dashboard
  if (deviceType === 'mobile') {
    return <MobileDashboard />;
  }
  
  // Tablet: Zeige Tablet Dashboard
  if (deviceType === 'tablet') {
    return <TabletDashboard />;
  }
  
  // Desktop - Mitarbeiter-Rolle (explizit employee und nicht Admin/HR): Zeige Mitarbeiter-Dashboard
  if (deviceType === 'desktop' && isEmployee && !isHRAdmin) {
    return <EmployeeDesktopDashboard />;
  }
  
  // Desktop - Admin/HR: Zeige Admin-Dashboard
  return <DesktopDashboard />;
};

export default Dashboard;