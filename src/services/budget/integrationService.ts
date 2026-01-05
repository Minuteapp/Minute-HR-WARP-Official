
import { supabase } from "@/integrations/supabase/client";
import type { BudgetIntegration } from "@/types/budgetEnterprise";

export const integrationService = {
  async createBudgetIntegration(integration: Omit<BudgetIntegration, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('budget_integrations')
      .insert(integration)
      .select()
      .single();

    if (error) throw error;
    return data as BudgetIntegration;
  },

  async getBudgetIntegrations(budgetPlanId?: string) {
    let query = supabase.from('budget_integrations').select('*');
    
    if (budgetPlanId) {
      query = query.eq('budget_plan_id', budgetPlanId);
    }

    const { data, error } = await query.order('integration_date', { ascending: false });
    if (error) throw error;
    return data as BudgetIntegration[];
  },

  async updateIntegrationStatus(id: string, status: 'synced' | 'pending' | 'failed') {
    const { data, error } = await supabase
      .from('budget_integrations')
      .update({ sync_status: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BudgetIntegration;
  }
};
