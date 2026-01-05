import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import policyMap from '@/config/policyMap';
import { normalizeModuleKey, normalizeActionKey } from '@/utils/permissionNormalization';

export interface Permission {
  id: string;
  role: string;
  module_id: string;
  action: string;
  scope: string;
  is_granted: boolean;
  conditions?: any;
  field_restrictions?: any;
  ui_restrictions?: any;
}

export interface PermissionModule {
  id: string;
  name: string;
  module_key: string;
  description?: string;
  is_active: boolean;
}

export interface UserPermissionOverride {
  id: string;
  user_id: string;
  module_id: string;
  action: string;
  scope: string;
  is_granted: boolean;
  expires_at?: string;
}

export interface RolePermissionMatrix {
  id: string;
  role: string;
  module_name: string;
  is_visible: boolean;
  allowed_actions: string[];
  visible_fields: any;
  editable_fields: any;
  allowed_notifications: string[];
  workflow_triggers: string[];
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [userOverrides, setUserOverrides] = useState<UserPermissionOverride[]>([]);
  const [roleMatrix, setRoleMatrix] = useState<RolePermissionMatrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Hole Benutzerrolle (mit Role Preview Support + Tenant Impersonation)
  // WICHTIG: Kein Fallback auf user.role oder user_metadata (Sicherheitsrisiko)
  const getUserRole = async (): Promise<string | null> => {
    if (!user?.id) return null;
    
    try {
      // 1. Prüfe zuerst ob Preview-Modus aktiv (nur für Superadmins)
      const { data: previewData, error: previewError } = await supabase
        .from('user_role_preview_sessions')
        .select('preview_role, is_preview_active')
        .eq('user_id', user.id)
        .eq('is_preview_active', true)
        .maybeSingle();
      
      if (!previewError && previewData?.preview_role) {
        return normalizeRoleForMatrix(previewData.preview_role);
      }
      
      // 2. Prüfe Tenant-Impersonation
      const { data: tenantSession } = await supabase
        .from('active_tenant_sessions')
        .select('impersonated_company_id, is_active')
        .eq('session_user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      // Falls impersonation aktiv, prüfe user_roles für die impersonierte Firma
      const companyFilter = tenantSession?.impersonated_company_id;
      
      // 3. Normale Rolle aus user_roles
      let query = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (companyFilter) {
        query = query.eq('company_id', companyFilter);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error || !data?.role) {
        // KEIN Fallback auf user.role oder user_metadata - Deny-by-default
        console.warn('usePermissions: Keine Rolle gefunden, verwende "employee"');
        return 'employee';
      }
      
      return normalizeRoleForMatrix(data.role);
    } catch (err) {
      console.error('usePermissions: Fehler beim Laden der Rolle:', err);
      return 'employee';
    }
  };
  
  // Normalisiert DB-Rollen auf die 5 Standard-Rollen
  const normalizeRoleForMatrix = (role: string): string => {
    const lowerRole = role?.toLowerCase() || 'employee';
    
    if (lowerRole === 'superadmin' || lowerRole.includes('superadmin')) return 'superadmin';
    if (lowerRole === 'admin') return 'admin';
    if (lowerRole === 'hr_admin' || lowerRole === 'hr_manager' || lowerRole === 'hr') return 'hr_admin';
    if (lowerRole === 'team_lead' || lowerRole === 'teamlead' || lowerRole === 'manager') return 'team_lead';
    if (lowerRole === 'employee' || lowerRole === 'mitarbeiter' || lowerRole === 'user') return 'employee';
    
    // Fallback für Admin-artige Rollen
    if (lowerRole.includes('admin') && !lowerRole.includes('hr')) return 'admin';
    
    return 'employee';
  };

  // Lade alle Berechtigungsmodule
  const loadModules = async () => {
    try {
      const { data, error } = await supabase
        .from('permission_modules')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setModules(data || []);
    } catch (err) {
      setError('Fehler beim Laden der Berechtigungsmodule');
    }
  };

  // Lade Rechtematrix für Rolle
  const loadRolePermissionMatrix = async (role?: string) => {
    if (!role) return;
    
    try {
      const { data, error } = await supabase
        .from('role_permission_matrix')
        .select('*')
        .eq('role', role);

      if (error) throw error;
      setRoleMatrix(data || []);
    } catch (err) {
      setError('Fehler beim Laden der Rechtematrix');
    }
  };

  // Lade Rollenberechtigungen
  const loadRolePermissions = async (role?: string) => {
    try {
      let query = supabase
        .from('role_permissions')
        .select('*');

      if (role) {
        // Korrekter Spaltenname ist 'role_name', nicht 'role'
        query = query.eq('role_name', role);
      }

      const { data, error } = await query.order('role_name').order('module_id');

      if (error) {
        setPermissions([]);
        return;
      }
      setPermissions(data || []);
    } catch (err) {
      setPermissions([]);
    }
  };

  // Lade Benutzer-spezifische Überschreibungen
  const loadUserOverrides = async (userId?: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_permission_overrides')
        .select('*')
        .eq('user_id', userId)
        .or('expires_at.is.null,expires_at.gt.now()');

      if (error) throw error;
      setUserOverrides(data || []);
    } catch (err) {
      setUserOverrides([]);
    }
  };

  // Prüfe, ob Benutzer eine bestimmte Berechtigung hat
  // WICHTIG: Matrix-first, Deny-by-default für unbekannte Module
  const hasPermission = (moduleKey: string, action: string = 'view', scope: string = 'own'): boolean => {
    if (!user) return false;

    // Normalisiere Module und Action für konsistente Prüfung
    const normalizedModule = normalizeModuleKey(moduleKey);
    const normalizedAction = normalizeActionKey(action);

    // WICHTIG: Prüfe ZUERST ob Role Preview aktiv ist
    // Wenn Preview aktiv, dann ist roleMatrix[0].role die Preview-Rolle
    const currentRole = roleMatrix.length > 0 ? roleMatrix[0].role : null;
    const hasActivePreview = currentRole && currentRole !== 'superadmin';
    
    // Superadmin ohne Preview darf alles
    if (currentRole === 'superadmin' && !hasActivePreview) {
      return true;
    }

    // Prüfe die Rechtematrix (DB) mit normalisierten Keys
    const matrixEntry = roleMatrix.find(entry => {
      const entryNormalized = normalizeModuleKey(entry.module_name);
      return entryNormalized === normalizedModule;
    });

    if (matrixEntry) {
      // Modul gefunden - prüfe Sichtbarkeit und Actions
      if (!matrixEntry.is_visible) {
        return false;
      }
      // Prüfe ob die normalisierte Action in allowed_actions ist
      return matrixEntry.allowed_actions.some(a => normalizeActionKey(a) === normalizedAction);
    }

    // Fallback 1: Benutzer-Überschreibungen (DB)
    const userOverride = userOverrides.find(override => 
      modules.find(m => m.id === override.module_id)?.module_key === moduleKey &&
      override.action === action &&
      override.scope === scope
    );

    if (userOverride) {
      return userOverride.is_granted;
    }

    // Fallback 2: Rollenberechtigungen (DB)
    const rolePermission = permissions.find(perm => 
      modules.find(m => m.id === perm.module_id)?.module_key === moduleKey &&
      perm.action === action &&
      perm.scope === scope
    );

    const hasRolePermission = rolePermission?.is_granted || false;
    if (hasRolePermission) {
      return true;
    }

    // Fallback 3: Zentrale policyMap (statisch, UI-Guards) – Deny-by-default wenn unbekannt
    const rawRole = (roleMatrix[0]?.role as string | undefined) 
      || ((user as any)?.role as string | undefined) 
      || ((user as any)?.user_metadata?.role as string | undefined) 
      || 'employee';

    const normalizedRole = (() => {
      const r = rawRole?.toLowerCase() || 'employee';
      if (r === 'superadmin' || r === 'admin') return 'Admin';
      if (r === 'hr' || r === 'hr_manager' || r === 'hr-manager') return 'HR-Manager';
      if (r === 'manager' || r === 'line_manager' || r === 'vorgesetzter') return 'Manager';
      if (r === 'teamlead' || r === 'team_lead' || r === 'teamleiter') return 'Teamleiter';
      if (r === 'payroll' || r === 'lohn' || r === 'lohnbuchhaltung') return 'Payroll';
      if (r === 'recruiter') return 'Recruiter';
      if (r === 'auditor' || r === 'compliance') return 'Auditor';
      if (r === 'it' || r === 'it_admin' || r === 'it-admin') return 'IT-Admin';
      if (r === 'trainer' || r === 'learning_admin' || r === 'learning') return 'Trainer';
      if (r === 'standort_manager' || r === 'standort-manager' || r === 'location_manager') return 'Standort-Manager';
      return 'Employee';
    })();

    const policyMapAction = action === 'view' ? 'read' : action === 'edit' ? 'update' : action;

    const modulePolicy = (policyMap.modules as any)[moduleKey];
    const roleModulePolicy: { actions: string[] } | undefined = modulePolicy?.[normalizedRole];

    if (roleModulePolicy?.actions?.includes(policyMapAction)) {
      return true;
    }

    const rolePolicy = (policyMap.roles as any)[normalizedRole];
    if (rolePolicy?.actions?.includes(policyMapAction)) {
      return true;
    }

    return false;
  };

  // Speichere Rollenberechtigung
  const saveRolePermission = async (rolePermission: Omit<Permission, 'id'>) => {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .upsert({
          role: rolePermission.role,
          module_id: rolePermission.module_id,
          action: rolePermission.action,
          scope: rolePermission.scope,
          is_granted: rolePermission.is_granted,
          conditions: rolePermission.conditions || {},
          field_restrictions: rolePermission.field_restrictions || {},
          ui_restrictions: rolePermission.ui_restrictions || {}
        }, {
          onConflict: 'role,module_id,action,scope'
        });

      if (error) throw error;
      
      // Daten neu laden
      const userRole = await getUserRole();
      await loadRolePermissions(userRole || undefined);
      return true;
    } catch (err) {
      throw new Error('Fehler beim Speichern der Berechtigung');
    }
  };

  // Speichere Benutzer-Überschreibung
  const saveUserOverride = async (override: Omit<UserPermissionOverride, 'id'>) => {
    try {
      const { error } = await supabase
        .from('user_permission_overrides')
        .upsert({
          user_id: override.user_id,
          module_id: override.module_id,
          action: override.action,
          scope: override.scope,
          is_granted: override.is_granted,
          expires_at: override.expires_at || null
        }, {
          onConflict: 'user_id,module_id,action,scope'
        });

      if (error) throw error;
      
      // Daten neu laden
      await loadUserOverrides(user?.id);
      return true;
    } catch (err) {
      throw new Error('Fehler beim Speichern der Benutzer-Überschreibung');
    }
  };

  // Hole verfügbare Aktionen für ein Modul
  const getAvailableActions = () => {
    return ['view', 'create', 'edit', 'delete', 'export', 'approve', 'sign', 'archive', 'audit', 'manage'];
  };

  // Hole verfügbare Bereiche
  const getAvailableScopes = () => {
    return ['own', 'team', 'department', 'location', 'global'];
  };

  // Reload-Funktion
  const reload = async () => {
    const userRole = await getUserRole();
    await loadModules();
    await loadRolePermissions(userRole || undefined);
    await loadRolePermissionMatrix(userRole || undefined);
    
    if (user?.id) {
      await loadUserOverrides(user.id);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const userRole = await getUserRole();
        
        await loadModules();
        await loadRolePermissions(userRole || undefined);
        await loadRolePermissionMatrix(userRole || undefined);
        
        if (user?.id) {
          await loadUserOverrides(user.id);
        }
      } catch (err) {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user?.id]);

  return {
    permissions,
    modules,
    userOverrides,
    roleMatrix,
    loading,
    error,
    hasPermission,
    loadRolePermissions,
    loadUserOverrides,
    saveRolePermission,
    saveUserOverride,
    getAvailableActions,
    getAvailableScopes,
    reload
  };
};