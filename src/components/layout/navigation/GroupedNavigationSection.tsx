import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavigationCategory, NavigationItem as NavItemType } from './NavigationConfig';
import { NavigationItem } from './NavigationItem';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GroupedNavigationSectionProps {
  categories: NavigationCategory[];
  isCollapsed: boolean;
}

export const GroupedNavigationSection: React.FC<GroupedNavigationSectionProps> = ({ 
  categories, 
  isCollapsed 
}) => {
  const { hasPermission } = usePermissionContext();
  const { user } = useAuth();
  const location = useLocation();
  
  // Track welche Kategorien geöffnet sind
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach(cat => {
      initial[cat.label] = cat.defaultOpen || false;
    });
    return initial;
  });

  // Öffne Kategorie automatisch wenn aktive Route darin ist
  useEffect(() => {
    categories.forEach(cat => {
      const hasActiveItem = cat.items.some(item => 
        location.pathname === item.path || 
        location.pathname.startsWith(item.path + '/')
      );
      if (hasActiveItem) {
        setOpenCategories(prev => ({ ...prev, [cat.label]: true }));
      }
    });
  }, [location.pathname, categories]);

  const toggleCategory = (label: string) => {
    setOpenCategories(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Hilfsfunktion um module_key aus dem Pfad zu extrahieren
  const getModuleKeyFromPath = (path: string): string => {
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
  };

  const filterItems = (items: NavItemType[]): NavItemType[] => {
    const userRole = user?.role;
    const metadataRole = user?.user_metadata?.role;
    const isSuperAdmin = userRole === 'superadmin' || metadataRole === 'superadmin';
    
    return items.filter(item => {
      if (isSuperAdmin) return true;
      
      const moduleKey = getModuleKeyFromPath(item.path);
      return hasPermission(moduleKey, 'view');
    });
  };

  if (isCollapsed) {
    // Im collapsed-Modus: Nur Icons aller Items anzeigen
    const allItems = categories.flatMap(cat => filterItems(cat.items));
    return (
      <div className="p-2">
        {allItems.map((item, index) => (
          <NavigationItem 
            key={`${item.path}-${index}`} 
            item={item} 
            isCollapsed={isCollapsed} 
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {categories.map((category) => {
        const filteredItems = filterItems(category.items);
        if (filteredItems.length === 0) return null;
        
        const isOpen = openCategories[category.label];
        const hasActiveItem = filteredItems.some(item => 
          location.pathname === item.path || 
          location.pathname.startsWith(item.path + '/')
        );
        
        return (
          <div key={category.label} className="mb-1">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.label)}
              className={cn(
                "w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium uppercase tracking-wider rounded-md transition-colors",
                hasActiveItem 
                  ? "text-primary bg-primary/5" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <span>{category.label}</span>
              {isOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            
            {/* Category Items */}
            {isOpen && (
              <div className="mt-1 ml-1 space-y-0.5">
                {filteredItems.map((item, index) => (
                  <NavigationItem 
                    key={`${item.path}-${index}`} 
                    item={item} 
                    isCollapsed={false} 
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
