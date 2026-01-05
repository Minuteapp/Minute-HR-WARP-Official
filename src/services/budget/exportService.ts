
import { supabase } from "@/integrations/supabase/client";
import type { BudgetExport } from "@/types/budgetEnterprise";

export const exportService = {
  async createBudgetExport(exportConfig: {
    export_type: string;
    export_format: string;
    data_filters?: Record<string, any>;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('budget_exports')
      .insert({
        ...exportConfig,
        exported_by: user?.id,
        download_count: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data as BudgetExport;
  },

  async getBudgetExports(filters?: {
    export_type?: string;
    exported_by?: string;
  }) {
    let query = supabase.from('budget_exports').select('*');
    
    if (filters?.export_type) {
      query = query.eq('export_type', filters.export_type);
    }
    if (filters?.exported_by) {
      query = query.eq('exported_by', filters.exported_by);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as BudgetExport[];
  }
};
