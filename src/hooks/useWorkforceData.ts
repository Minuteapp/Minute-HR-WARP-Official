import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Department {
  id: string;
  name: string;
  description: string;
  budget: number;
  created_at: string;
}

export interface WorkforceAnalytics {
  id: string;
  period_date: string;
  department_id: string;
  total_employees: number;
  new_hires: number;
  departures: number;
  turnover_rate: number;
  avg_tenure_months: number;
  cost_per_employee: number;
  productivity_score: number;
  satisfaction_score: number;
  department_name?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  is_technical: boolean;
}

export const useWorkforceData = () => {
  // ALLE QUERIES RESPEKTIEREN JETZT TENANT-ISOLATION VIA RLS
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Department[];
    },
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['workforce-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workforce_analytics')
        .select(`
          *,
          departments!inner(name)
        `)
        .order('period_date', { ascending: false });
      
      if (error) throw error;
      return data?.map(item => ({
        ...item,
        department_name: item.departments?.name
      })) as WorkforceAnalytics[];
    },
  });

  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Skill[];
    },
  });

  // Berechne Gesamtstatistiken
  const totalEmployees = analytics?.reduce((sum, item) => sum + item.total_employees, 0) || 0;
  const totalNewHires = analytics?.reduce((sum, item) => sum + item.new_hires, 0) || 0;
  const avgTurnoverRate = analytics?.length ? 
    analytics.reduce((sum, item) => sum + item.turnover_rate, 0) / analytics.length : 0;
  const avgSatisfaction = analytics?.length ?
    analytics.reduce((sum, item) => sum + item.satisfaction_score, 0) / analytics.length : 0;

  return {
    departments,
    analytics,
    skills,
    isLoading: departmentsLoading || analyticsLoading || skillsLoading,
    stats: {
      totalEmployees,
      totalNewHires,
      avgTurnoverRate,
      avgSatisfaction,
    }
  };
};