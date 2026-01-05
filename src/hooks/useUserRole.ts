import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'superadmin' | 'admin' | 'hr_admin' | 'team_lead' | 'employee';

interface UserRoleData {
  role: UserRole;
  company_id: string | null;
}

export const useUserRole = () => {
  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[useUserRole] No user found');
        return [];
      }

      console.log('[useUserRole] Fetching roles for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, company_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('[useUserRole] Error fetching roles:', error);
        throw error;
      }
      
      console.log('[useUserRole] Roles found:', data);
      return data as UserRoleData[];
    },
  });

  const hasRole = (role: UserRole): boolean => {
    return roles.some((r) => r.role === role);
  };

  const isHRAdmin = hasRole('hr_admin') || hasRole('admin');
  const isManager = hasRole('team_lead');
  const isEmployee = roles.length === 0 || hasRole('employee'); // Default to employee

  return {
    roles,
    hasRole,
    isHRAdmin,
    isManager,
    isEmployee,
    isLoading,
  };
};
