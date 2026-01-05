import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logAccess } from '@/lib/access-logger';
import { toast } from 'sonner';

// =====================================================
// Types
// =====================================================

export interface FunctionalRole {
  id: string;
  employee_id: string;
  role_name: string;
  role_type: 'hauptrolle' | 'projektrolle' | 'zusatzrolle';
  badge_label: string;
  badge_color: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  responsibilities: string[];
  created_at: string;
  updated_at: string;
}

export interface EmployeePermission {
  id: string;
  employee_id: string;
  category: string;
  module: string;
  permission_level: 'none' | 'read' | 'write' | 'full';
  granted_by_role?: string;
  is_custom_override: boolean;
  effective_from?: string;
  effective_until?: string;
}

export interface RolePermissionTemplate {
  id: string;
  role_name: string;
  category: string;
  module: string;
  permission_level: 'none' | 'read' | 'write' | 'full';
  description?: string;
  is_system_default: boolean;
}

export interface RoleHierarchy {
  id: string;
  employee_id: string;
  reports_to_employee_id?: string;
  reports_to_name?: string;
  reports_to_position?: string;
  is_substituted_by_employee_id?: string;
  is_substituted_by_name?: string;
  is_substituted_by_position?: string;
  substitutes_for_employee_ids?: string[];
  substitutes_for_names?: string[];
  substitutes_for_positions?: string[];
}

export interface AccessLog {
  id: string;
  employee_id: string;
  action: string;
  module: string;
  category?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface PermissionCategory {
  id: string;
  category_name: string;
  display_order: number;
  icon?: string;
  description?: string;
  is_active: boolean;
}

export interface PermissionModule {
  id: string;
  category_id: string;
  module_name: string;
  module_key: string;
  display_order: number;
  description?: string;
  requires_approval: boolean;
  audit_trail_required: boolean;
  is_active: boolean;
}

// =====================================================
// Helper to get auth user_id from employee
// =====================================================

const getEmployeeUserId = async (employeeId: string): Promise<string | null> => {
  const { data: employee } = await supabase
    .from('employees')
    .select('id, user_id, email')
    .eq('id', employeeId)
    .maybeSingle();
  
  if (employee?.user_id) {
    return employee.user_id;
  }
  
  // Fallback: try to find profile by email
  if (employee?.email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', employee.email)
      .maybeSingle();
    
    if (profile?.id) {
      return profile.id;
    }
  }
  
  return null;
};

// =====================================================
// Data Fetching Hooks
// =====================================================

export const useSystemRole = (employeeId: string) => {
  return useQuery({
    queryKey: ['system-role', employeeId],
    queryFn: async () => {
      // First get the auth user_id from the employee
      const userId = await getEmployeeUserId(employeeId);
      
      if (!userId) {
        // Return default employee role if no user_id found
        return { role: 'employee', company_id: null };
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role, company_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching system role:', error);
        throw error;
      }
      
      return data || { role: 'employee', company_id: null };
    },
    enabled: !!employeeId,
  });
};

export const useFunctionalRoles = (employeeId: string) => {
  return useQuery({
    queryKey: ['functional-roles', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_functional_roles')
        .select('*')
        .eq('employee_id', employeeId)
        .order('is_active', { ascending: false })
        .order('start_date', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching functional roles:', error);
        throw error;
      }
      return (data || []) as FunctionalRole[];
    },
    enabled: !!employeeId,
  });
};

export const useEmployeePermissions = (employeeId: string) => {
  return useQuery({
    queryKey: ['employee-permissions', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_permissions')
        .select('*')
        .eq('employee_id', employeeId);

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching permissions:', error);
        throw error;
      }
      return (data || []) as EmployeePermission[];
    },
    enabled: !!employeeId,
  });
};

export const usePermissionMatrix = () => {
  return useQuery({
    queryKey: ['permission-matrix'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permission_templates')
        .select('*')
        .order('role_name')
        .order('category')
        .order('module');

      if (error) throw error;
      return data as RolePermissionTemplate[];
    },
  });
};

export const useRoleHierarchy = (employeeId: string) => {
  return useQuery({
    queryKey: ['role-hierarchy', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_role_hierarchy')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching role hierarchy:', error);
        throw error;
      }
      return data as RoleHierarchy | null;
    },
    enabled: !!employeeId,
  });
};

export const useAccessLogs = (employeeId: string, hours: number = 24) => {
  return useQuery({
    queryKey: ['access-logs', employeeId, hours],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_access_logs')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching access logs:', error);
        throw error;
      }
      return (data || []) as AccessLog[];
    },
    enabled: !!employeeId,
  });
};

export const usePermissionCategories = () => {
  return useQuery({
    queryKey: ['permission-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permission_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching permission categories:', error);
        throw error;
      }
      return (data || []) as PermissionCategory[];
    },
  });
};

export const usePermissionModules = (categoryId?: string) => {
  return useQuery({
    queryKey: ['permission-modules', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('permission_modules')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching permission modules:', error);
        throw error;
      }
      return (data || []) as PermissionModule[];
    },
    enabled: !categoryId || !!categoryId,
  });
};

export const useEmployeeRolesData = (employeeId: string) => {
  const systemRole = useSystemRole(employeeId);
  const functionalRoles = useFunctionalRoles(employeeId);
  const permissions = useEmployeePermissions(employeeId);
  const hierarchy = useRoleHierarchy(employeeId);
  const accessLogs = useAccessLogs(employeeId);
  const categories = usePermissionCategories();

  return {
    systemRole: systemRole.data,
    functionalRoles: functionalRoles.data || [],
    permissions: permissions.data || [],
    hierarchy: hierarchy.data,
    accessLogs: accessLogs.data || [],
    categories: categories.data || [],
    isLoading:
      systemRole.isLoading ||
      functionalRoles.isLoading ||
      permissions.isLoading ||
      hierarchy.isLoading ||
      accessLogs.isLoading ||
      categories.isLoading,
    error: null, // Don't propagate errors to prevent "Unbekannter Fehler"
  };
};

// =====================================================
// Mutation Hooks
// =====================================================

export const useAddFunctionalRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRole: Omit<FunctionalRole, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('employee_functional_roles')
        .insert([newRole])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['functional-roles', variables.employee_id] });
    },
  });
};

export const useRemoveFunctionalRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, employeeId }: { roleId: string; employeeId: string }) => {
      const { error } = await supabase
        .from('employee_functional_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['functional-roles', variables.employeeId] });
    },
  });
};

export const useUpdatePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      permissionId,
      updates,
    }: {
      permissionId: string;
      updates: Partial<EmployeePermission>;
    }) => {
      const { data, error } = await supabase
        .from('employee_permissions')
        .update(updates)
        .eq('id', permissionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employee-permissions', data.employee_id] });
    },
  });
};

export const useUpdateRoleHierarchyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      employeeId,
      updates,
    }: {
      employeeId: string;
      updates: Partial<RoleHierarchy>;
    }) => {
      const { data, error } = await supabase
        .from('employee_role_hierarchy')
        .upsert({ employee_id: employeeId, ...updates })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['role-hierarchy', data.employee_id] });
    },
  });
};

interface UpdateRolePermissionTemplateParams {
  role: string;
  category: string;
  module: string;
  newLevel: string;
  reason: string;
  changedBy?: string;
}

export const useUpdateRolePermissionTemplateMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      role,
      category,
      module,
      newLevel,
      reason,
      changedBy,
    }: UpdateRolePermissionTemplateParams) => {
      // 1. Get old value
      const { data: oldPermission } = await supabase
        .from('role_permission_templates')
        .select('*')
        .eq('role_name', role)
        .eq('category', category)
        .eq('module', module)
        .single();
      
      // 2. Update permission
      const { data: updated, error } = await supabase
        .from('role_permission_templates')
        .update({ permission_level: newLevel })
        .eq('role_name', role)
        .eq('category', category)
        .eq('module', module)
        .select()
        .single();
      
      if (error) throw error;
      
      // 3. Log change in audit table
      await supabase
        .from('role_permission_changes')
        .insert({
          change_type: 'permission_modified',
          old_value: oldPermission,
          new_value: updated,
          changed_by: changedBy,
          approval_status: 'approved', // Auto-approved für Admins
          reason,
        });
      
      // 4. Log access if changedBy is provided
      if (changedBy) {
        await logAccess({
          employeeId: changedBy,
          action: `Berechtigung geändert: ${role} - ${module} (${oldPermission?.permission_level} → ${newLevel})`,
          module: 'Berechtigungen',
          category: 'edit',
          details: { role, category, module, oldLevel: oldPermission?.permission_level, newLevel, reason },
        });
      }
      
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-matrix'] });
      toast.success('Berechtigung erfolgreich aktualisiert');
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
};
