
import React, { useEffect, useState } from 'react';
import { NavigationItem as NavItem } from './NavigationConfig';
import { NavigationItem } from './NavigationItem';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface NavigationSectionProps {
  items: NavItem[];
  isCollapsed: boolean;
}

export const NavigationSection: React.FC<NavigationSectionProps> = ({ items, isCollapsed }) => {
  const { hasPermission, roleMatrix } = usePermissionContext();
  const { user } = useAuth();
  const [hasActivePreview, setHasActivePreview] = useState(false);
  
  // Prüfe ob Role-Preview aktiv ist
  useEffect(() => {
    const checkPreview = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('user_role_preview_sessions')
        .select('preview_role, is_preview_active')
        .eq('user_id', user.id)
        .eq('is_preview_active', true)
        .maybeSingle();
      
      setHasActivePreview(!!data);
    };
    
    checkPreview();
  }, [user?.id, roleMatrix]);
  
  const filteredItems = items.filter(item => {
    // SuperAdmin-Status prüfen
    const userRole = user?.role;
    const metadataRole = user?.user_metadata?.role;
    const isSuperAdmin = userRole === 'superadmin' || metadataRole === 'superadmin';
    
    // KRITISCH: Admin-Modul NUR für echte SuperAdmins OHNE aktive Preview
    if (item.path === '/admin') {
      if (isSuperAdmin && !hasActivePreview) {
        return true;
      }
      return false;
    }
    
    // SuperAdmin ohne Preview: Sieht alles
    if (isSuperAdmin && !hasActivePreview) {
      return true;
    }
    
    // Alle anderen (inkl. SuperAdmin MIT Preview): Berechtigungsprüfung
    const moduleKey = getModuleKeyFromPath(item.path);
    const hasViewPermission = hasPermission(moduleKey, 'view');
    
    return hasViewPermission;
  });

  // Hilfsfunktion um module_key aus dem Pfad zu extrahieren
  function getModuleKeyFromPath(path: string): string {
    const pathMap: Record<string, string> = {
      '/': 'dashboard',
      '/today': 'dashboard', 
      '/time': 'time_tracking',
      '/absence': 'absence',
      '/tasks': 'tasks',
      '/projects': 'projects',
      '/documents': 'documents',
      '/payroll': 'payroll',
      '/recruiting': 'recruiting',
      '/performance': 'performance',
      '/settings': 'settings',
      '/employees': 'employees',
      '/calendar': 'calendar',
      '/reports': 'reports',
      '/goals': 'goals',
      '/budget': 'budget',
      '/admin': 'admin',
      '/profile': 'profil'
    };
    
    return pathMap[path] || path.substring(1).replace(/\//g, '_');
  }
  
  return (
    <div className="p-2">
      {filteredItems.map((item, index) => (
        <NavigationItem 
          key={`${item.path}-${index}`} 
          item={item} 
          isCollapsed={isCollapsed} 
        />
      ))}
    </div>
  );
};
