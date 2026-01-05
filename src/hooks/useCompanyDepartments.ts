import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCompanyDepartments = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['company-departments'],
    queryFn: async () => {
      // Departments werden jetzt durch RLS automatisch nach company_id gefiltert
      const { data: deptTable, error: deptError } = await supabase
        .from('departments')
        .select('name, id, company_id')
        .order('name');

      if (!deptError && deptTable && deptTable.length > 0) {
        return deptTable.map(dept => ({ id: dept.id, name: dept.name }));
      }

      // Fallback: get distinct departments from employees table
      const { data: employeeDepts, error: empError } = await supabase
        .from('employees')
        .select('department')
        .not('department', 'is', null)
        .order('department');

      if (empError) {
        console.error('Error fetching departments:', empError);
        return [];
      }

      // Remove duplicates and return as array of objects
      const uniqueDepartments = [...new Set(employeeDepts?.map(emp => emp.department))];
      return uniqueDepartments.map(dept => ({ id: dept, name: dept }));
    }
  });

  // Mutation zum Erstellen einer neuen Abteilung
  const createDepartment = useMutation({
    mutationFn: async (data: { name: string; company_id: string; description?: string }) => {
      const { data: dept, error } = await supabase
        .from('departments')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return dept;
    },
    onSuccess: (data) => {
      // Query invalidieren für Live-Update
      queryClient.invalidateQueries({ queryKey: ['company-departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      console.log('[useCompanyDepartments] Department created:', data.name);
      toast.success(`Abteilung "${data.name}" wurde erstellt`);
    },
    onError: (error) => {
      console.error('[useCompanyDepartments] Error creating department:', error);
      toast.error('Fehler beim Erstellen der Abteilung');
    }
  });

  return {
    ...query,
    createDepartment: createDepartment.mutate,
    isCreating: createDepartment.isPending
  };
};

export const useCompanyTeams = (department?: string) => {
  return useQuery({
    queryKey: ['company-teams', department],
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select('team')
        .not('team', 'is', null);

      if (department) {
        query = query.eq('department', department);
      }

      const { data, error } = await query.order('team');

      if (error) {
        console.error('Error fetching teams:', error);
        return [];
      }

      // Remove duplicates and return as array of objects
      const uniqueTeams = [...new Set(data?.map(emp => emp.team))];
      return uniqueTeams.map(team => ({ id: team, name: team }));
    },
    enabled: !!department || department === undefined
  });
};