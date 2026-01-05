
import { supabase } from "@/integrations/supabase/client";
import type { BudgetRolePermission } from "@/types/budgetEnterprise";

export const permissionService = {
  async createBudgetPermission(permission: Omit<BudgetRolePermission, 'id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('budget_permissions')
      .insert({
        ...permission,
        granted_by: user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as BudgetRolePermission;
  },

  async getBudgetPermissions(userId?: string) {
    let query = supabase.from('budget_permissions').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as BudgetRolePermission[];
  },

  async revokeBudgetPermission(id: string) {
    const { data, error } = await supabase
      .from('budget_permissions')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BudgetRolePermission;
  }
};
