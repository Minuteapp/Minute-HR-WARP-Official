
import { supabase } from "@/integrations/supabase/client";
import type { BudgetApprovalWorkflow } from "@/types/budgetEnterprise";

export const approvalService = {
  async getApprovalWorkflows() {
    const { data, error } = await supabase
      .from('budget_approval_workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Simuliere die fehlenden Eigenschaften für die UI
    return (data || []).map(workflow => ({
      ...workflow,
      current_level: 1,
      approval_levels: workflow.approval_steps || [],
      approvals: workflow.approval_steps || []
    })) as BudgetApprovalWorkflow[];
  },

  async approveWorkflowStep(workflowId: string, stepId: string, comments?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('budget_approval_workflows')
      .update({
        workflow_status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', workflowId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
