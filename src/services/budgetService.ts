
import { supabase } from "@/integrations/supabase/client";
import type { BudgetPlan, CreateBudgetPlanRequest } from "@/types/budget";

export const budgetService = {
  async getBudgetPlans() {
    const { data, error } = await supabase
      .from('budget_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as BudgetPlan[];
  },

  async createBudgetPlan(request: CreateBudgetPlanRequest) {
    const { data: user } = await supabase.auth.getUser();
    
    // company_id über RPC ermitteln (unterstützt Tenant-Modus)
    const { data: companyId } = await supabase.rpc('get_effective_company_id');
    
    if (!companyId) {
      throw new Error('Keine Firma zugeordnet. Bitte wählen Sie eine Firma aus.');
    }
    
    const { data, error } = await supabase
      .from('budget_plans')
      .insert({
        name: request.name,
        type: request.type,
        assigned_to: request.assigned_to,
        assigned_to_name: request.assigned_to_name,
        currency: request.currency || 'EUR',
        amount: request.amount,
        start_date: request.start_date,
        end_date: request.end_date,
        status: 'draft',
        used_amount: 0,
        reserved_amount: 0,
        remaining_amount: request.amount,
        template_id: request.template_id,
        category: request.category,
        responsible_person: request.responsible_person,
        department: request.department,
        comments: request.comments,
        company_id: companyId,
        created_by: user?.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as BudgetPlan;
  },

  async updateBudgetPlan(id: string, updates: Partial<BudgetPlan>) {
    const { data, error } = await supabase
      .from('budget_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BudgetPlan;
  },

  async deleteBudgetPlan(id: string) {
    const { error } = await supabase
      .from('budget_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
