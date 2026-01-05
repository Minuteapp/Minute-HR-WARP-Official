import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TenantStats {
  admins: number;
  modules: number;
  lastActivity: string | null;
  country: string;
}

export const useTenantStats = (companyIds: string[]) => {
  return useQuery({
    queryKey: ['tenant-stats', companyIds],
    queryFn: async () => {
      if (companyIds.length === 0) return {};

      const stats: Record<string, TenantStats> = {};

      // Initialisiere Stats für alle Companies
      companyIds.forEach(id => {
        stats[id] = {
          admins: 0,
          modules: 0,
          lastActivity: null,
          country: 'Deutschland'
        };
      });

      // Hole Admin-Counts aus user_roles
      const { data: adminData } = await supabase
        .from('user_roles')
        .select('company_id')
        .in('company_id', companyIds)
        .in('role', ['admin', 'superadmin']);

      (adminData || []).forEach(row => {
        if (row.company_id && stats[row.company_id]) {
          stats[row.company_id].admins++;
        }
      });

      // Hole Module-Counts aus company_module_assignments
      const { data: moduleData } = await supabase
        .from('company_module_assignments')
        .select('company_id')
        .in('company_id', companyIds)
        .eq('is_active', true);

      (moduleData || []).forEach(row => {
        if (row.company_id && stats[row.company_id]) {
          stats[row.company_id].modules++;
        }
      });

      // Hole letzte Aktivität aus audit_logs
      const { data: activityData } = await supabase
        .from('audit_logs')
        .select('company_id, created_at')
        .in('company_id', companyIds)
        .order('created_at', { ascending: false });

      // Gruppiere nach company_id und nimm das neueste
      const activityMap: Record<string, string> = {};
      (activityData || []).forEach(row => {
        if (row.company_id && !activityMap[row.company_id]) {
          activityMap[row.company_id] = row.created_at;
        }
      });

      Object.keys(activityMap).forEach(companyId => {
        if (stats[companyId]) {
          stats[companyId].lastActivity = activityMap[companyId];
        }
      });

      // Hole Country aus companies.address (parse oder nutze Fallback)
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, address, country')
        .in('id', companyIds);

      (companyData || []).forEach(row => {
        if (row.id && stats[row.id]) {
          // Prüfe ob country Feld existiert, sonst parse aus address
          const country = (row as any).country || 
            (row.address?.includes('Deutschland') ? 'Deutschland' : 
             row.address?.includes('Österreich') ? 'Österreich' :
             row.address?.includes('Schweiz') ? 'Schweiz' : 'Deutschland');
          stats[row.id].country = country;
        }
      });

      return stats;
    },
    enabled: companyIds.length > 0
  });
};
