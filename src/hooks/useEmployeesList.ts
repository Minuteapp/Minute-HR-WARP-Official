import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee.types';

export const useEmployeesList = () => {
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, first_name, last_name, position, department')
        .eq('status', 'active')
        .neq('archived', true)
        .order('first_name', { ascending: true });

      if (error) throw error;
      return data as Employee[];
    }
  });

  return { employees: employees || [], isLoading };
};