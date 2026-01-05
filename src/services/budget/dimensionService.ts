
import { supabase } from "@/integrations/supabase/client";
import type { BudgetDimensionConfig } from "@/types/budgetEnterprise";

export const dimensionService = {
  async getBudgetDimensions(dimension_type?: string) {
    let query = supabase.from('budget_dimensions').select('*');
    
    if (dimension_type) {
      query = query.eq('dimension_type', dimension_type);
    }

    const { data, error } = await query.eq('is_active', true);
    if (error) throw error;
    return data as BudgetDimensionConfig[];
  },

  async createBudgetDimension(dimension: Omit<BudgetDimensionConfig, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('budget_dimensions')
      .insert(dimension)
      .select()
      .single();

    if (error) throw error;
    return data as BudgetDimensionConfig;
  }
};
