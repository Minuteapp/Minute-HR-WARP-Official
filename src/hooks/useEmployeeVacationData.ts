import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VacationData {
  annual_entitlement: number;
  taken: number;
  remaining: number;
  carryover: number;
  planned: number;
}

export const useEmployeeVacationData = (employeeId: string) => {
  return useQuery<VacationData>({
    queryKey: ['employee-vacation', employeeId],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      
      // Fetch vacation quota
      const { data: quota } = await supabase
        .from('absence_quotas')
        .select('*')
        .eq('user_id', employeeId)
        .eq('quota_year', currentYear)
        .single();
      
      // Fetch approved vacation days taken this year
      const { data: taken } = await supabase
        .from('absence_requests')
        .select('start_date, end_date, half_day')
        .eq('user_id', employeeId)
        .eq('status', 'approved')
        .eq('type', 'vacation')
        .gte('start_date', `${currentYear}-01-01`)
        .lte('end_date', `${currentYear}-12-31`);
      
      // Fetch planned (pending) vacation days
      const { data: planned } = await supabase
        .from('absence_requests')
        .select('start_date, end_date, half_day')
        .eq('user_id', employeeId)
        .eq('status', 'pending')
        .eq('type', 'vacation')
        .gte('start_date', new Date().toISOString());
      
      // Calculate total taken days
      const totalTaken = taken?.reduce((sum, req) => {
        const start = new Date(req.start_date);
        const end = new Date(req.end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + (req.half_day ? days * 0.5 : days);
      }, 0) || 0;
      
      // Calculate planned days
      const totalPlanned = planned?.reduce((sum, req) => {
        const start = new Date(req.start_date);
        const end = new Date(req.end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + (req.half_day ? days * 0.5 : days);
      }, 0) || 0;
      
      const annualEntitlement = quota?.total_days || 0;
      const carryover = quota?.carryover_days || 0;
      
      return {
        annual_entitlement: annualEntitlement,
        taken: totalTaken,
        remaining: annualEntitlement + carryover - totalTaken,
        carryover: carryover,
        planned: totalPlanned
      };
    },
    enabled: !!employeeId
  });
};
