import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_locked: boolean | null;
  company_id: string | null;
  company_name: string | null;
  role: string;
  last_login: string | null;
  two_factor_enabled: boolean;
}

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Hole alle Profile mit korrekten Spalten-Namen
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          is_manager
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Hole alle Employees mit Email-Adressen
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select(`
          id,
          user_id,
          email,
          first_name,
          last_name,
          company_id,
          is_active
        `);

      if (employeesError) throw employeesError;

      // Hole alle user_roles mit company Informationen
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          company_id,
          companies(name)
        `);

      if (rolesError) throw rolesError;

      // Hole Login-Historie
      const { data: loginHistory, error: loginError } = await supabase
        .from('user_login_history')
        .select('user_id, login_at')
        .eq('success', true)
        .order('login_at', { ascending: false });

      if (loginError) throw loginError;

      // Kombiniere die Daten
      const users: AdminUser[] = (profiles || []).map(profile => {
        // Finde zugehörigen Employee
        const employee = employees?.find(e => e.user_id === profile.id);
        const userRole = userRoles?.find(r => r.user_id === profile.id);
        const lastLogin = loginHistory?.find(l => l.user_id === profile.id);
        
        // Namen aus Employee oder full_name splitten
        let firstName = employee?.first_name || null;
        let lastName = employee?.last_name || null;
        
        if (!firstName && !lastName && profile.full_name) {
          const nameParts = profile.full_name.split(' ');
          firstName = nameParts[0] || null;
          lastName = nameParts.slice(1).join(' ') || null;
        }

        return {
          id: profile.id,
          email: employee?.email || profile.username || '-',
          first_name: firstName,
          last_name: lastName,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          is_locked: false, // profiles hat kein is_locked
          company_id: userRole?.company_id || employee?.company_id || null,
          company_name: (userRole?.companies as any)?.name || null,
          role: userRole?.role || 'employee',
          last_login: lastLogin?.login_at || null,
          two_factor_enabled: false // Müsste aus auth.users geholt werden
        };
      });

      return users;
    }
  });
};

export const useAdminUsersStats = () => {
  const { data: users, isLoading } = useAdminUsers();

  const stats = {
    total: users?.length || 0,
    admins: users?.filter(u => u.role === 'admin' || u.role === 'superadmin').length || 0,
    withTwoFA: users?.filter(u => u.two_factor_enabled).length || 0,
    locked: users?.filter(u => u.is_locked).length || 0
  };

  return { stats, isLoading };
};
