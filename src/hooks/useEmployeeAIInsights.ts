import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AIInsight {
  id: string;
  employee_id: string;
  has_insights: boolean;
  leadership_potential?: number;
  technical_skills?: number;
  collaboration?: number;
  summary?: string;
  recommendations?: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  generated_at: string;
  expires_at: string;
}

export const useEmployeeAIInsights = (employeeId: string) => {
  return useQuery<AIInsight>({
    queryKey: ['employee-ai-insights', employeeId],
    queryFn: async () => {
      // 1. Check cached insights in DB
      const { data: cached } = await supabase
        .from('employee_ai_insights')
        .select('*')
        .eq('employee_id', employeeId)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (cached) {
        return cached as AIInsight;
      }
      
      // 2. Generate new insights via Edge Function
      const { data, error } = await supabase.functions.invoke('employee-ai-insights', {
        body: { employee_id: employeeId }
      });
      
      if (error) throw error;
      return data as AIInsight;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1
  });
};
