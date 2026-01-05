import TodayDashboard from "@/components/today/TodayDashboard";
import MobileTodayDashboard from "@/components/today/mobile/MobileTodayDashboard";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useIsMobile } from "@/hooks/use-device-type";

const TodayPage = () => {
  const { isAdmin, isSuperAdmin } = useRolePermissions();
  const isMobile = useIsMobile();
  
  // Auto-Weiterleitung entfernt, um allen Benutzerrollen Zugriff auf die Heute-Seite zu ermöglichen
  // Jetzt können auch Admins und SuperAdmins die Heute-Seite verwenden

  // Zeige mobile Version auf mobilen Geräten, Desktop-Version auf Desktop
  if (isMobile) {
    return <MobileTodayDashboard />;
  }

  return <TodayDashboard />;
};

export default TodayPage;
