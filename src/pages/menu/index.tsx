import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { featureNavigationItems } from "@/components/layout/navigation/NavigationConfig";
import MobileNavigation from "@/components/dashboard/mobile/MobileNavigation";
import { useSidebarPermissions } from "@/hooks/useSidebarPermissions";

const MenuPage = () => {
  const navigate = useNavigate();
  const { isModuleVisible, effectiveRole, loading } = useSidebarPermissions();
  
  // Filtere Module basierend auf 80/20-Matrix (konsistent mit Sidebar)
  const modules = useMemo(() => {
    if (loading) return [];
    
    // Bestimmte Module für mobile Nutzung ausschließen
    const disabledForMobile = ['payroll', 'settings'];
    
    // SuperAdmin: Eingeschränkte Mobile-Nutzung
    if (effectiveRole === 'superadmin') {
      return featureNavigationItems.filter(
        item => ['notifications', 'admin'].includes(item.path.replace('/', ''))
      );
    }
    
    // Alle anderen Rollen: Filtere nach 80/20-Matrix UND Mobile-Einschränkungen
    return featureNavigationItems.filter(item => {
      // Prüfe ob Modul für Mobile deaktiviert ist
      if (disabledForMobile.includes(item.path.replace('/', ''))) {
        return false;
      }
      // Prüfe Berechtigung aus der 80/20-Matrix
      return isModuleVisible(item.path);
    });
  }, [isModuleVisible, effectiveRole, loading]);

  return (
    <div className="bg-[#EEF2FF] min-h-screen pb-20">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#2c3ad1] py-4 px-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white mr-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-white">Mehr</h1>
      </div>
      
      <div className="pt-16 px-4 pb-4">
        {effectiveRole === 'superadmin' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
            <p className="text-sm text-amber-800">
              Hinweis: Als SuperAdmin ist die mobile Nutzung eingeschränkt. Für volle Funktionalität bitte die Web-Version nutzen.
            </p>
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {modules.map((item) => (
              <Card 
                key={item.path}
                className="p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors" 
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-5 w-5 text-[#2c3ad1] mb-2" />
                <span className="text-xs text-center">{item.label}</span>
              </Card>
            ))}
          </div>
        )}
        
        {/* Deaktivierte Module anzeigen - nur wenn diese sichtbar wären */}
        {effectiveRole !== 'superadmin' && (isModuleVisible('/payroll') || isModuleVisible('/settings')) && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Nur in Web-Version verfügbar</h2>
            <div className="grid grid-cols-3 gap-3">
              {isModuleVisible('/payroll') && (
                <Card className="p-3 flex flex-col items-center justify-center opacity-50">
                  <DollarSign className="h-5 w-5 text-gray-400 mb-2" />
                  <span className="text-xs text-center text-gray-500">Lohn & Gehalt</span>
                </Card>
              )}
              {isModuleVisible('/settings') && (
                <Card className="p-3 flex flex-col items-center justify-center opacity-50">
                  <Settings2 className="h-5 w-5 text-gray-400 mb-2" />
                  <span className="text-xs text-center text-gray-500">Einstellungen</span>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
      
      <MobileNavigation />
    </div>
  );
};

// Icons für deaktivierte Module
const DollarSign = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" y1="2" x2="12" y2="22"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const Settings2 = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 7h-9"></path>
    <path d="M14 17H5"></path>
    <circle cx="17" cy="17" r="3"></circle>
    <circle cx="7" cy="7" r="3"></circle>
  </svg>
);

export default MenuPage;
