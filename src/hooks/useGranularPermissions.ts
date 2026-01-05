import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GranularPermission {
  module_name: string;
  submodule_name?: string;
  actions: string[];
  fieldPermissions: Record<string, 'read' | 'write' | 'hidden'>;
  approvalRequired: boolean;
  notificationTypes: string[];
  reportAccess: string[];
  auditAccess: boolean;
  automationAccess: string[];
}

export interface PermissionModule {
  id: string;
  name: string;
  module_key: string;
  description: string;
  module_type: 'main' | 'submodule';
  parent_module_id?: string;
  icon?: string;
  color?: string;
  submodules?: PermissionModule[];
}

export interface PermissionAction {
  id: string;
  action_key: string;
  action_name: string;
  description: string;
  category: string;
  requires_approval: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export const useGranularPermissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Lade alle verfügbaren Aktionen
  const { data: actions = [], isLoading: actionsLoading } = useQuery({
    queryKey: ['permission-actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permission_actions')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data as PermissionAction[];
    }
  });

  // Lade Module mit Tree-Struktur
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['permission-modules-tree'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permission_modules')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      // Organisiere in Tree-Struktur
      const mainModules = data.filter(m => m.module_type === 'main');
      const subModules = data.filter(m => m.module_type === 'submodule');
      
      return mainModules.map(mainModule => ({
        ...mainModule,
        submodules: subModules.filter(sub => sub.parent_module_id === mainModule.id)
      })) as PermissionModule[];
    }
  });

  // Lade effektive Berechtigungen für aktuellen User
  const { data: userPermissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['user-granular-permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('get_user_effective_permissions', { p_user_id: user.id });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id
  });

  // Lade Approval Workflows
  const { data: approvalWorkflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ['approval-workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_workflows')
        .select('*')
        .eq('is_active', true)
        .order('workflow_name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Lade Field-Level Permissions
  const { data: fieldPermissions = [], isLoading: fieldPermissionsLoading } = useQuery({
    queryKey: ['field-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('field_permissions')
        .select('*')
        .order('module_name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Mutation zum Aktualisieren von Berechtigungen
  const updatePermissionsMutation = useMutation({
    mutationFn: async (updates: { 
      role: string; 
      permissions: any[] 
    }) => {
      const { role, permissions } = updates;
      
      // Lösche existierende Berechtigungen für diese Rolle
      const { error: deleteError } = await supabase
        .from('role_permission_matrix')
        .delete()
        .eq('role', role);
      
      if (deleteError) throw deleteError;
      
      // Füge neue Berechtigungen hinzu
      if (permissions.length > 0) {
        const { error: insertError } = await supabase
          .from('role_permission_matrix')
          .insert(permissions.map(p => ({ ...p, role })));
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-granular-permissions'] });
      toast({
        title: "Erfolgreich",
        description: "Berechtigungen wurden aktualisiert."
      });
    },
    onError: (error) => {
      console.error('Fehler beim Aktualisieren der Berechtigungen:', error);
      toast({
        title: "Fehler",
        description: "Berechtigungen konnten nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  });

  // Helper Functions für Berechtigungsprüfungen
  const hasModuleAccess = (moduleName: string): boolean => {
    const permission = userPermissions.find(p => p.module_name === moduleName);
    return permission?.is_visible || false;
  };

  const hasAction = (moduleName: string, actionKey: string): boolean => {
    const permission = userPermissions.find(p => p.module_name === moduleName);
    return permission?.allowed_actions?.includes(actionKey) || false;
  };

  const hasFieldAccess = (moduleName: string, fieldName: string, accessType: 'read' | 'write' = 'read'): boolean => {
    const fieldPerm = fieldPermissions.find(
      fp => fp.module_name === moduleName && fp.field_name === fieldName
    );
    
    if (!fieldPerm) return true; // Standardmäßig erlaubt wenn nicht konfiguriert
    
    if (accessType === 'read') {
      return fieldPerm.permission_type !== 'hidden';
    } else {
      return fieldPerm.permission_type === 'write';
    }
  };

  const requiresApproval = (moduleName: string, actionKey: string): boolean => {
    const action = actions.find(a => a.action_key === actionKey);
    if (!action?.requires_approval) return false;
    
    const workflow = approvalWorkflows.find(
      w => w.module_name === moduleName && w.action_key === actionKey
    );
    
    return !!workflow;
  };

  const getApprovalChain = (moduleName: string, actionKey: string): any[] => {
    const workflow = approvalWorkflows.find(
      w => w.module_name === moduleName && w.action_key === actionKey
    );
    
    return workflow?.approval_chain || [];
  };

  const canReceiveNotification = (moduleName: string, notificationType: string): boolean => {
    const permission = userPermissions.find(p => p.module_name === moduleName);
    return permission?.allowed_notifications?.includes(notificationType) || false;
  };

  const hasReportAccess = (moduleName: string, reportType: string): boolean => {
    const permission = userPermissions.find(p => p.module_name === moduleName);
    return permission?.report_permissions?.[reportType] || false;
  };

  const hasAuditAccess = (moduleName: string): boolean => {
    const permission = userPermissions.find(p => p.module_name === moduleName);
    return permission?.audit_permissions?.view_audit_log || false;
  };

  const canManageAutomations = (moduleName: string, automationType: string): boolean => {
    const permission = userPermissions.find(p => p.module_name === moduleName);
    return permission?.automation_permissions?.[automationType] || false;
  };

  const getActionsByCategory = (): Record<string, PermissionAction[]> => {
    return actions.reduce((acc, action) => {
      if (!acc[action.category]) acc[action.category] = [];
      acc[action.category].push(action);
      return acc;
    }, {} as Record<string, PermissionAction[]>);
  };

  const getModulesByParent = (parentId?: string): PermissionModule[] => {
    if (!parentId) {
      return modules.filter(m => !m.parent_module_id);
    }
    return modules.filter(m => m.parent_module_id === parentId);
  };

  const isLoading = actionsLoading || modulesLoading || permissionsLoading || 
                   workflowsLoading || fieldPermissionsLoading;

  return {
    // Data
    actions,
    modules,
    userPermissions,
    approvalWorkflows,
    fieldPermissions,
    
    // Loading States
    isLoading,
    actionsLoading,
    modulesLoading,
    permissionsLoading,
    workflowsLoading,
    fieldPermissionsLoading,
    
    // Mutations
    updatePermissions: updatePermissionsMutation.mutate,
    isUpdating: updatePermissionsMutation.isPending,
    
    // Helper Functions
    hasModuleAccess,
    hasAction,
    hasFieldAccess,
    requiresApproval,
    getApprovalChain,
    canReceiveNotification,
    hasReportAccess,
    hasAuditAccess,
    canManageAutomations,
    getActionsByCategory,
    getModulesByParent,
    
    // Convenience Functions
    canView: (module: string) => hasAction(module, 'view'),
    canCreate: (module: string) => hasAction(module, 'create'),
    canEdit: (module: string) => hasAction(module, 'edit'),
    canDelete: (module: string) => hasAction(module, 'delete'),
    canExport: (module: string) => hasAction(module, 'export'),
    canApprove: (module: string) => hasAction(module, 'approve'),
    canViewReports: (module: string) => hasAction(module, 'view_reports'),
    canCreateReports: (module: string) => hasAction(module, 'create_reports'),
    canViewAuditLog: (module: string) => hasAction(module, 'view_audit_log'),
    canManageGDPR: (module: string) => hasAction(module, 'gdpr_delete'),
    canBulkOperations: (module: string) => hasAction(module, 'bulk_operations'),
    canSystemAdmin: (module: string) => hasAction(module, 'system_admin'),
    canImpersonate: (module: string) => hasAction(module, 'impersonate')
  };
};