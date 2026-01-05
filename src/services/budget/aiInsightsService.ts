
import { supabase } from "@/integrations/supabase/client";
import type { AIBudgetInsight } from "@/types/budgetEnterprise";

export const aiInsightsService = {
  async generateAIInsights(budgetPlanId?: string) {
    let query = supabase.from('ai_budget_insights').select('*');
    
    if (budgetPlanId) {
      query = query.eq('budget_plan_id', budgetPlanId);
    }

    const { data, error } = await query.order('generated_at', { ascending: false });
    if (error) throw error;
    return data as AIBudgetInsight[];
  },

  async getBudgetHealthMetrics(budgetPlanId?: string) {
    let query = supabase.from('budget_health_metrics').select('*');
    
    if (budgetPlanId) {
      query = query.eq('budget_plan_id', budgetPlanId);
    }

    const { data, error } = await query.order('last_calculated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateBudgetHealthMetrics(budgetPlanId: string, metrics: any) {
    const { data, error } = await supabase
      .from('budget_health_metrics')
      .upsert({
        budget_plan_id: budgetPlanId,
        ...metrics,
        last_calculated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
