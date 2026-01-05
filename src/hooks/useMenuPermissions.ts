import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MenuPermission {
  menuKey: string;
  menuName: string;
  menuOrder: number;
  isVisible: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  scope: 'own' | 'team' | 'department' | 'all';
  requiresTeamContext: boolean;
  icon?: string;
}

export interface ModuleMenuPermissions {
  moduleKey: string;
  permissions: MenuPermission[];
}

interface MenuItem {
  menu_key: string;
  menu_name: string;
  menu_order: number;
  requires_team_context: boolean;
  icon: string | null;
}

interface RoleMenuPermission {
  menu_key: string;
  is_visible: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  scope: string;
}

export function useMenuPermissions(moduleKey: string) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<MenuPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('employee');
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user?.id || !moduleKey) {
        setLoading(false);
        return;
      }

      try {
        // 1. Get user's role and company_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, company_id')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        const role = profile?.role || 'employee';
        const company = profile?.company_id;
        setUserRole(role);
        setCompanyId(company);

        // Map old roles to new 4-role system
        const mappedRole = mapToFourRoleSystem(role);

        // 2. Get all menu items for this module
        const { data: menuItems, error: menuError } = await supabase
          .from('module_menu_items')
          .select('menu_key, menu_name, menu_order, requires_team_context, icon')
          .eq('module_key', moduleKey)
          .eq('is_active', true)
          .order('menu_order');

        if (menuError) throw menuError;

        // 3. Get role permissions (company-specific first, then global defaults)
        const { data: rolePerms, error: permError } = await supabase
          .from('role_menu_permissions')
          .select('menu_key, is_visible, can_edit, can_delete, can_approve, scope')
          .eq('role', mappedRole)
          .eq('module_key', moduleKey)
          .or(`company_id.is.null,company_id.eq.${company}`);

        if (permError) throw permError;

        // Build permission map (company-specific overrides global)
        const permMap = new Map<string, RoleMenuPermission>();
        (rolePerms || []).forEach(p => {
          // Only override if not already set (company-specific comes first)
          if (!permMap.has(p.menu_key)) {
            permMap.set(p.menu_key, p);
          }
        });

        // 4. Combine menu items with permissions
        const result: MenuPermission[] = (menuItems || []).map((item: MenuItem) => {
          const perm = permMap.get(item.menu_key);
          return {
            menuKey: item.menu_key,
            menuName: item.menu_name,
            menuOrder: item.menu_order,
            isVisible: perm?.is_visible ?? false,
            canEdit: perm?.can_edit ?? false,
            canDelete: perm?.can_delete ?? false,
            canApprove: perm?.can_approve ?? false,
            scope: (perm?.scope as MenuPermission['scope']) || 'own',
            requiresTeamContext: item.requires_team_context,
            icon: item.icon || undefined
          };
        });

        setPermissions(result);
      } catch (err: any) {
        console.error('Error loading menu permissions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [user?.id, moduleKey]);

  // Helper: Map old role names to 4-role system
  const mapToFourRoleSystem = (role: string): string => {
    switch (role) {
      case 'superadmin':
      case 'admin':
        return 'admin';
      case 'hr_manager':
      case 'hr_admin':
        return 'hr_admin';
      case 'manager':
      case 'team_lead':
      case 'teamleiter':
        return 'team_lead';
      default:
        return 'employee';
    }
  };

  // Check if a specific menu item is visible
  const hasMenuAccess = useCallback((menuKey: string): boolean => {
    const perm = permissions.find(p => p.menuKey === menuKey);
    return perm?.isVisible ?? false;
  }, [permissions]);

  // Get scope for a specific menu item
  const getScope = useCallback((menuKey: string): MenuPermission['scope'] => {
    const perm = permissions.find(p => p.menuKey === menuKey);
    return perm?.scope ?? 'own';
  }, [permissions]);

  // Check if user can edit in a specific menu
  const canEdit = useCallback((menuKey: string): boolean => {
    const perm = permissions.find(p => p.menuKey === menuKey);
    return perm?.canEdit ?? false;
  }, [permissions]);

  // Check if user can approve in a specific menu
  const canApprove = useCallback((menuKey: string): boolean => {
    const perm = permissions.find(p => p.menuKey === menuKey);
    return perm?.canApprove ?? false;
  }, [permissions]);

  // Get all visible menu items
  const visibleMenuItems = useMemo(() => {
    return permissions.filter(p => p.isVisible).sort((a, b) => a.menuOrder - b.menuOrder);
  }, [permissions]);

  return {
    permissions,
    visibleMenuItems,
    hasMenuAccess,
    getScope,
    canEdit,
    canApprove,
    loading,
    error,
    userRole,
    companyId
  };
}

// Hook to get all module permissions for settings/admin view
export function useAllModulePermissions() {
  const [modules, setModules] = useState<{ module_key: string; menu_name: string }[]>([]);
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllModules = async () => {
      try {
        // Get all unique modules
        const { data: items, error } = await supabase
          .from('module_menu_items')
          .select('module_key, menu_key, menu_name, menu_order, requires_team_context, icon')
          .eq('is_active', true)
          .order('module_key')
          .order('menu_order');

        if (error) throw error;

        // Group by module
        const grouped: Record<string, MenuItem[]> = {};
        const uniqueModules: { module_key: string; menu_name: string }[] = [];
        const seenModules = new Set<string>();

        (items || []).forEach((item: MenuItem & { module_key: string }) => {
          if (!grouped[item.module_key]) {
            grouped[item.module_key] = [];
          }
          grouped[item.module_key].push(item);

          if (!seenModules.has(item.module_key)) {
            seenModules.add(item.module_key);
            uniqueModules.push({ 
              module_key: item.module_key, 
              menu_name: getModuleDisplayName(item.module_key) 
            });
          }
        });

        setModules(uniqueModules);
        setMenuItems(grouped);
      } catch (err) {
        console.error('Error loading all modules:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllModules();
  }, []);

  return { modules, menuItems, loading };
}

// Helper: Get display name for module
function getModuleDisplayName(moduleKey: string): string {
  const names: Record<string, string> = {
    absence: 'Abwesenheit',
    time: 'Zeiterfassung',
    payroll: 'Lohn/Gehalt',
    projects: 'Projekte',
    recruiting: 'Recruiting',
    onboarding: 'Onboarding',
    helpdesk: 'Helpdesk',
    documents: 'Dokumente',
    goals: 'Ziele',
    performance: 'Performance',
    shifts: 'Schichtplanung',
    travel: 'Reisekosten',
    expenses: 'Spesen',
    innovation: 'Innovation',
    surveys: 'Umfragen',
    dashboard: 'Dashboard',
    settings: 'Einstellungen'
  };
  return names[moduleKey] || moduleKey;
}

// Hook to load and save role permissions for admin
export function useRoleMenuPermissionsAdmin(role: string, companyId: string | null) {
  const [permissions, setPermissions] = useState<Record<string, Record<string, RoleMenuPermission>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPermissions = useCallback(async () => {
    if (!role) return;

    setLoading(true);
    try {
      // Load all permissions for this role (global + company-specific)
      const { data, error } = await supabase
        .from('role_menu_permissions')
        .select('*')
        .eq('role', role)
        .or(`company_id.is.null${companyId ? `,company_id.eq.${companyId}` : ''}`);

      if (error) throw error;

      // Group by module_key -> menu_key
      const grouped: Record<string, Record<string, RoleMenuPermission>> = {};
      (data || []).forEach((p: any) => {
        if (!grouped[p.module_key]) {
          grouped[p.module_key] = {};
        }
        // Company-specific overrides global
        if (!grouped[p.module_key][p.menu_key] || p.company_id) {
          grouped[p.module_key][p.menu_key] = p;
        }
      });

      setPermissions(grouped);
    } catch (err) {
      console.error('Error loading role permissions:', err);
    } finally {
      setLoading(false);
    }
  }, [role, companyId]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const savePermission = async (
    moduleKey: string,
    menuKey: string,
    updates: Partial<RoleMenuPermission>
  ) => {
    if (!companyId) {
      console.error('Cannot save without company_id');
      return false;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('role_menu_permissions')
        .upsert({
          role,
          module_key: moduleKey,
          menu_key: menuKey,
          company_id: companyId,
          is_visible: updates.is_visible ?? true,
          can_edit: updates.can_edit ?? false,
          can_delete: updates.can_delete ?? false,
          can_approve: updates.can_approve ?? false,
          scope: updates.scope ?? 'own',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'role,module_key,menu_key,company_id'
        });

      if (error) throw error;

      // Reload permissions
      await loadPermissions();
      return true;
    } catch (err) {
      console.error('Error saving permission:', err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const getPermission = (moduleKey: string, menuKey: string): RoleMenuPermission | null => {
    return permissions[moduleKey]?.[menuKey] || null;
  };

  return {
    permissions,
    loading,
    saving,
    savePermission,
    getPermission,
    reload: loadPermissions
  };
}
