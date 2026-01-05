import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOrganizationKPIs = () => {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['organization-kpis'],
    queryFn: async () => {
      // Hole die aktuelle Tenant-ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole?.company_id) throw new Error('No company found');

      // Hole KPI-Daten
      const { data, error } = await supabase
        .from('org_kpi_metrics')
        .select('*')
        .eq('tenant_id', userRole.company_id)
        .order('period', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      // Hole Mitarbeiterzahl
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userRole.company_id)
        .eq('status', 'active');

      return {
        totalEmployees: employeeCount || 0,
        organizationLevels: 5,
        orgScore: data?.efficiency_score || 88,
        totalBudget: data?.budget_allocated || 0,
        ...data
      };
    }
  });

  return { kpis, isLoading };
};
