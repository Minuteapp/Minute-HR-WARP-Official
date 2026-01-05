import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OrgRole {
  id: string;
  role_type: string;
  is_primary: boolean;
  organizational_unit_id: string;
}

interface OrgUnit {
  id: string;
  name: string;
  type: string;
  manager_id: string | null;
}

interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  position: string | null;
}

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  position: string | null;
  role_type: string;
}

export interface EmployeeOrgContext {
  role: OrgRole | null;
  unit: OrgUnit | null;
  manager: Manager | null;
  teamMembers: TeamMember[];
}

export const useEmployeeOrgContext = (employeeId: string) => {
  return useQuery({
    queryKey: ['employee-org-context', employeeId],
    queryFn: async (): Promise<EmployeeOrgContext> => {
      // 1. Hole die aktive Rolle des Mitarbeiters
      const { data: roleData, error: roleError } = await supabase
        .from('organizational_roles')
        .select('id, role_type, is_primary, organizational_unit_id')
        .eq('user_id', employeeId)
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching org role:', roleError);
        return { role: null, unit: null, manager: null, teamMembers: [] };
      }

      if (!roleData) {
        return { role: null, unit: null, manager: null, teamMembers: [] };
      }

      // 2. Hole die zugehörige Organisationseinheit
      const { data: unitData, error: unitError } = await supabase
        .from('organizational_units')
        .select('id, name, type, manager_id')
        .eq('id', roleData.organizational_unit_id)
        .maybeSingle();

      if (unitError) {
        console.error('Error fetching org unit:', unitError);
      }

      // 3. Hole den Manager (wenn vorhanden)
      let manager: Manager | null = null;
      if (unitData?.manager_id) {
        const { data: managerData } = await supabase
          .from('employees')
          .select('id, first_name, last_name, position')
          .eq('id', unitData.manager_id)
          .maybeSingle();
        
        if (managerData) {
          manager = managerData;
        }
      }

      // 4. Hole Team-Mitglieder (andere in derselben Einheit, außer dem aktuellen)
      const { data: teamRolesData } = await supabase
        .from('organizational_roles')
        .select(`
          user_id,
          role_type,
          user:employees!organizational_roles_user_id_fkey(id, first_name, last_name, position)
        `)
        .eq('organizational_unit_id', roleData.organizational_unit_id)
        .eq('is_active', true)
        .neq('user_id', employeeId)
        .limit(10);

      const teamMembers: TeamMember[] = (teamRolesData || [])
        .filter((r: any) => r.user)
        .map((r: any) => ({
          id: r.user.id,
          first_name: r.user.first_name,
          last_name: r.user.last_name,
          position: r.user.position,
          role_type: r.role_type
        }));

      return {
        role: roleData,
        unit: unitData,
        manager,
        teamMembers
      };
    },
    enabled: !!employeeId
  });
};
