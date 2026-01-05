import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee.types';

export const useCompanyEmployees = (companyId: string | undefined) => {
  const { data: employees, isLoading } = useQuery({
    queryKey: ['company-employees', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyId)
        .neq('archived', true)
        .order('first_name', { ascending: true });

      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!companyId
  });

  return { employees: employees || [], isLoading };
};
