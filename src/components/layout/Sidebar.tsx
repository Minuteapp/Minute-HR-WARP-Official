import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useSidebarPermissions } from '@/hooks/useSidebarPermissions';
import { useIsMobile } from '@/hooks/use-device-type';
import { useTenant } from '@/contexts/TenantContext';
import { extractTenantFromUrl } from '@/utils/tenant';
import { SidebarHeader } from './navigation/SidebarHeader';
import { NavigationSection } from './navigation/NavigationSection';
import { 
  mainNavigationItems, 
  featureNavigationItems,
  bottomNavigationItems,
  adminNavigationItem
} from './navigation/NavigationConfig';
import { UserCircle2, Settings2, Shield, Calendar } from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isSuperAdmin, isAdmin, hasPermission } = useRolePermissions();
  const { isModuleVisible, moduleActions, effectiveRole, loading: permissionsLoading } = useSidebarPermissions();
  const isMobile = useIsMobile();
  const { isSuperAdmin: isTenantSuperAdmin } = useTenant();
  const [renderCount, setRenderCount] = useState(0);

  // Force a re-render when component mounts
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, []);

  // Hide sidebar completely on mobile devices
  if (isMobile) {
    return null;
  }

  // DIRECT SUPERADMIN CHECK
  const userRoleFromMetadata = user?.user_metadata?.role?.toLowerCase();
  const directSuperAdmin = userRoleFromMetadata === 'superadmin';
  
  // IMPORTANT: Direct construction of Bottom Navigation Items
  const bottomItems = [];
  
  // Manual creation of NavigationItems to ensure all properties are correct
  const profileNavItem = {
    icon: UserCircle2,
    label: 'Profil',
    path: '/profile'
  };
  
  const settingsNavItem = {
    icon: Settings2, 
    label: 'Einstellungen', 
    path: '/settings'
  };
  
  const adminNavItem = {
    icon: Shield,
    label: 'Admin',
    path: '/admin'
  };
  
  // CRITICAL: Explicit ordering of navigation elements
  bottomItems.push(profileNavItem);
  
  // Einstellungen nur anzeigen wenn Benutzer mehr als nur Leserechte hat
  // (also edit, create, oder delete - nicht nur view)
  const settingsActions = moduleActions['settings'] || [];
  const hasSettingsEditAccess = settingsActions.some(action => 
    ['edit', 'create', 'delete'].includes(action.toLowerCase())
  );
  
  // SuperAdmin/Admin sieht Einstellungen immer, andere nur mit Bearbeitungsrechten
  if (isSuperAdmin || directSuperAdmin || hasSettingsEditAccess) {
    bottomItems.push(settingsNavItem);
  }
  
  // KRITISCH: Admin-Modul NUR für echte SuperAdmins UND NUR wenn KEIN Tenant aktiv ist
  // Wenn ein Tenant-Parameter in der URL ist, befinden wir uns IN einer Firma und das Admin-Modul muss ausgeblendet werden
  const currentTenant = extractTenantFromUrl();
  const isInTenantContext = currentTenant !== null;
  
  if ((isSuperAdmin || directSuperAdmin) && !isInTenantContext) {
    bottomItems.push(adminNavItem);
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Zeige Rollen-Preview-Hinweis wenn aktiv
  const showPreviewIndicator = effectiveRole && effectiveRole !== userRoleFromMetadata && !isSuperAdmin && !directSuperAdmin;

  return (
    <div className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 flex flex-col ${isCollapsed ? 'w-16' : 'w-56'}`}>
      {/* Preview-Warnung wenn aktiv */}
      {showPreviewIndicator && (
        <div className="bg-amber-100 border-b border-amber-300 px-2 py-1 text-xs text-amber-800 text-center">
          Vorschau: {effectiveRole}
        </div>
      )}
      <SidebarHeader
        isCollapsed={isCollapsed} 
        toggleCollapse={toggleCollapse} 
      />
      
      <nav className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-none">
        {/* Main navigation elements */}
        <NavigationSection 
          items={mainNavigationItems} 
          isCollapsed={isCollapsed} 
        />
        
        <div className="border-t border-primary/30 my-1" />
        
        {/* Feature navigation elements - Flache Liste */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          <NavigationSection 
            items={featureNavigationItems.filter(item => {
              // Nur SuperAdmin überspringt die Berechtigungsprüfung komplett
              // Admin-Rolle wird jetzt auch über die DB-Matrix geprüft (80/20 Regel)
              if (isSuperAdmin) {
                return true;
              }
              
              // Für alle anderen Rollen: DB-basierte Berechtigung prüfen
              return isModuleVisible(item.path);
            })}
            isCollapsed={isCollapsed} 
          />
        </div>
        
        <div className="border-t border-primary/30 my-1" />
        
        {/* Bottom navigation elements - CRITICAL SECTION */}
        <div className="mt-auto">
          <NavigationSection 
            items={bottomItems}
            isCollapsed={isCollapsed} 
          />
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
