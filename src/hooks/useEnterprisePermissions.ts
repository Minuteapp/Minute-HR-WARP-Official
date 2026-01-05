import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeModuleKey, normalizeActionKey } from '@/utils/permissionNormalization';
import { useUserRole } from './useUserRole';

export interface UserPermissions {
  module_name: string;
  module_id: string;
  is_visible: boolean;
  allowed_actions: string[];
  visible_fields: Record<string, any>;
  editable_fields: Record<string, any>;
  allowed_notifications: string[];
  workflow_triggers: string[];
}

export const useEnterprisePermissions = () => {
  const { user } = useAuth();
  const { isHRAdmin, isManager, isEmployee: isEmployeeRole } = useUserRole();

  const { data: permissions = [], isLoading, error } = useQuery({
    queryKey: ['user-effective-permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // 1. Prüfe zuerst ob Preview-Modus aktiv (nur für Superadmins)
      const { data: previewData } = await supabase
        .from('user_role_preview_sessions')
        .select('preview_role, is_preview_active')
        .eq('user_id', user.id)
        .eq('is_preview_active', true)
        .maybeSingle();
      
      let effectiveUserId = user.id;
      
      // Im Preview-Modus: Nutze die Preview-Rolle für Berechtigungen
      // ABER: Verwende weiterhin die echte User-ID für RPC-Call
      // (Die RPC-Funktion muss Preview intern handhaben)
      
      const { data, error } = await supabase
        .rpc('get_user_effective_permissions', { p_user_id: effectiveUserId });

      if (error) throw error;
      
      // Wenn Preview aktiv: Logge das für Debugging
      if (previewData?.is_preview_active) {
        console.log('🎭 Enterprise Permissions im Preview-Modus:', previewData.preview_role);
      }
      
      return data as UserPermissions[];
    },
    enabled: !!user?.id,
  });

  // Helper functions - mit Normalisierung für konsistente Modul-Keys
  const hasAccess = (moduleName: string) => {
    const normalizedModule = normalizeModuleKey(moduleName);
    const permission = permissions.find(p => normalizeModuleKey(p.module_name) === normalizedModule);
    return permission?.is_visible || false;
  };

  const hasAction = (moduleName: string, action: string) => {
    const normalizedModule = normalizeModuleKey(moduleName);
    const normalizedAction = normalizeActionKey(action);
    const permission = permissions.find(p => normalizeModuleKey(p.module_name) === normalizedModule);
    if (!permission?.allowed_actions) return false;
    return permission.allowed_actions.some(a => normalizeActionKey(a) === normalizedAction);
  };

  const canView = (moduleName: string) => hasAction(moduleName, 'view');
  const canCreate = (moduleName: string) => hasAction(moduleName, 'create');
  const canEdit = (moduleName: string) => hasAction(moduleName, 'edit');
  const canDelete = (moduleName: string) => hasAction(moduleName, 'delete');
  const canExport = (moduleName: string) => hasAction(moduleName, 'export');
  const canApprove = (moduleName: string) => hasAction(moduleName, 'approve');

  const getVisibleFields = (moduleName: string) => {
    const normalizedModule = normalizeModuleKey(moduleName);
    const permission = permissions.find(p => normalizeModuleKey(p.module_name) === normalizedModule);
    return permission?.visible_fields || {};
  };

  const getEditableFields = (moduleName: string) => {
    const normalizedModule = normalizeModuleKey(moduleName);
    const permission = permissions.find(p => normalizeModuleKey(p.module_name) === normalizedModule);
    return permission?.editable_fields || {};
  };

  const canReceiveNotification = (moduleName: string, notificationType: string) => {
    const normalizedModule = normalizeModuleKey(moduleName);
    const permission = permissions.find(p => normalizeModuleKey(p.module_name) === normalizedModule);
    return permission?.allowed_notifications?.includes(notificationType) || false;
  };

  // Prüft ob der Benutzer die Rolle "employee" hat (keine Admin/HR-Rechte)
  const isEmployee = isEmployeeRole && !isHRAdmin && !isManager;
  const isTeamLead = isManager;
  const isAdmin = isHRAdmin;

  return {
    permissions,
    isLoading,
    error,
    // Helper functions
    hasAccess,
    hasAction,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    canApprove,
    getVisibleFields,
    getEditableFields,
    canReceiveNotification,
    // Role shortcuts
    isEmployee,
    isTeamLead,
    isAdmin,
  };
};