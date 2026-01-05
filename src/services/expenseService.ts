
import { supabase } from "@/integrations/supabase/client";
import { 
  ExpenseItem, 
  ExpenseFilter, 
  Budget, 
  CostCenter, 
  ExpenseSummary,
  ExpenseComment,
  Attachment
} from "@/types/expenses";

/**
 * Fetch expenses with optional filtering
 */
export const fetchExpenses = async (filter?: ExpenseFilter): Promise<ExpenseItem[]> => {
  try {
    let query = supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filter?.status?.length) {
      query = query.in('status', filter.status);
    }
    
    if (filter?.category?.length) {
      query = query.in('category', filter.category);
    }
    
    if (filter?.dateFrom) {
      query = query.gte('date', filter.dateFrom);
    }
    
    if (filter?.dateTo) {
      query = query.lte('date', filter.dateTo);
    }
    
    if (filter?.minAmount) {
      query = query.gte('amount', filter.minAmount);
    }
    
    if (filter?.maxAmount) {
      query = query.lte('amount', filter.maxAmount);
    }
    
    if (filter?.currency) {
      query = query.eq('currency', filter.currency);
    }
    
    if (filter?.costCenter) {
      query = query.eq('cost_center', filter.costCenter);
    }
    
    if (filter?.projectId) {
      query = query.eq('project_id', filter.projectId);
    }
    
    if (filter?.businessTripId) {
      query = query.eq('business_trip_id', filter.businessTripId);
    }
    
    if (filter?.searchQuery) {
      query = query.or(`description.ilike.%${filter.searchQuery}%,category.ilike.%${filter.searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }

    return data as ExpenseItem[];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

/**
 * Fetch a single expense by ID
 */
export const fetchExpenseById = async (id: string): Promise<ExpenseItem | null> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching expense:', error);
      throw error;
    }

    return data as ExpenseItem;
  } catch (error) {
    console.error('Error fetching expense:', error);
    throw error;
  }
};

/**
 * Create a new expense
 */
export const createExpense = async (expense: Omit<ExpenseItem, 'id' | 'created_at' | 'updated_at'>): Promise<ExpenseItem> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // company_id über RPC ermitteln (unterstützt Tenant-Modus)
    const { data: companyId } = await supabase.rpc('get_effective_company_id');
    
    if (!companyId) {
      throw new Error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expense,
        company_id: companyId,
        user_id: userData.user.id,
        submitted_by: userData.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      throw error;
    }

    return data as ExpenseItem;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

/**
 * Update an existing expense
 */
export const updateExpense = async (id: string, updates: Partial<ExpenseItem>): Promise<ExpenseItem> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw error;
    }

    return data as ExpenseItem;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

/**
 * Delete an expense
 */
export const deleteExpense = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

/**
 * Submit an expense for approval
 */
export const submitExpense = async (id: string): Promise<ExpenseItem> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        status: 'submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error submitting expense:', error);
      throw error;
    }

    return data as ExpenseItem;
  } catch (error) {
    console.error('Error submitting expense:', error);
    throw error;
  }
};

/**
 * Approve an expense
 */
export const approveExpense = async (id: string, comment?: string): Promise<ExpenseItem> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Get current expense to update approval chain
    const { data: expense } = await supabase
      .from('expenses')
      .select('approval_chain')
      .eq('id', id)
      .single();

    const currentApprovalChain = expense?.approval_chain || [];
    const newApprovalStep = {
      id: crypto.randomUUID(),
      role: 'approver',
      approver_id: userData.user.id,
      status: 'approved',
      comment: comment,
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('expenses')
      .update({
        status: 'approved',
        approval_chain: [...currentApprovalChain, newApprovalStep],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error approving expense:', error);
      throw error;
    }

    return data as ExpenseItem;
  } catch (error) {
    console.error('Error approving expense:', error);
    throw error;
  }
};

/**
 * Reject an expense
 */
export const rejectExpense = async (id: string, comment: string): Promise<ExpenseItem> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Get current expense to update approval chain
    const { data: expense } = await supabase
      .from('expenses')
      .select('approval_chain')
      .eq('id', id)
      .single();

    const currentApprovalChain = expense?.approval_chain || [];
    const newApprovalStep = {
      id: crypto.randomUUID(),
      role: 'approver',
      approver_id: userData.user.id,
      status: 'rejected',
      comment: comment,
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('expenses')
      .update({
        status: 'rejected',
        approval_chain: [...currentApprovalChain, newApprovalStep],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting expense:', error);
      throw error;
    }

    return data as ExpenseItem;
  } catch (error) {
    console.error('Error rejecting expense:', error);
    throw error;
  }
};

/**
 * Add attachment to expense
 */
export const addAttachment = async (expenseId: string, file: File): Promise<Attachment> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // For now, return a mock attachment since we don't have storage set up
    const attachment: Attachment = {
      id: crypto.randomUUID(),
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: URL.createObjectURL(file), // Temporary URL
      upload_date: new Date().toISOString(),
      uploaded_by: userData.user.id
    };

    // Get current expense to update attachments
    const { data: expense } = await supabase
      .from('expenses')
      .select('attachments')
      .eq('id', expenseId)
      .single();

    const currentAttachments = expense?.attachments || [];

    const { error } = await supabase
      .from('expenses')
      .update({
        attachments: [...currentAttachments, attachment],
        updated_at: new Date().toISOString()
      })
      .eq('id', expenseId);

    if (error) {
      console.error('Error adding attachment:', error);
      throw error;
    }

    return attachment;
  } catch (error) {
    console.error('Error adding attachment:', error);
    throw error;
  }
};

/**
 * Add comment to expense
 */
export const addComment = async (expenseId: string, comment: string, isInternal = false): Promise<ExpenseComment> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const newComment: ExpenseComment = {
      id: crypto.randomUUID(),
      expense_id: expenseId,
      user_id: userData.user.id,
      comment: comment,
      timestamp: new Date().toISOString(),
      is_internal: isInternal
    };

    // Get current expense to update comments
    const { data: expense } = await supabase
      .from('expenses')
      .select('comments')
      .eq('id', expenseId)
      .single();

    const currentComments = expense?.comments || [];

    const { error } = await supabase
      .from('expenses')
      .update({
        comments: [...currentComments, newComment],
        updated_at: new Date().toISOString()
      })
      .eq('id', expenseId);

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }

    return newComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

/**
 * Fetch budgets from database
 */
export const fetchBudgets = async (): Promise<Budget[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_plans')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }

    // Map budget_plans to Budget interface
    return (data || []).map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.comments || undefined,
      amount: plan.amount || 0,
      currency: (plan.currency || 'EUR') as 'EUR' | 'USD' | 'GBP' | 'CHF' | 'JPY' | 'CAD' | 'AUD' | 'CNY',
      start_date: plan.start_date,
      end_date: plan.end_date,
      spent_amount: plan.used_amount || 0,
      remaining_amount: plan.remaining_amount || 0,
      status: plan.remaining_amount && plan.remaining_amount < 0 ? 'overbudget' : 'active'
    })) as Budget[];
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};

/**
 * Fetch cost centers from database
 */
export const fetchCostCenters = async (): Promise<CostCenter[]> => {
  try {
    const { data, error } = await supabase
      .from('cost_centers')
      .select('*')
      .eq('is_active', true)
      .order('code');

    if (error) {
      // Fallback to basic cost centers if table doesn't exist
      console.warn('Cost centers table may not exist, using fallback:', error.message);
      return [
        { id: '1', code: 'IT-001', name: 'IT-Abteilung', description: 'Informationstechnologie', is_active: true },
        { id: '2', code: 'HR-001', name: 'Personalabteilung', description: 'Human Resources', is_active: true },
        { id: '3', code: 'SALES-001', name: 'Vertrieb', description: 'Verkauf und Marketing', is_active: true }
      ];
    }

    return (data || []).map(cc => ({
      id: cc.id,
      code: cc.code || '',
      name: cc.name,
      description: cc.description || undefined,
      is_active: cc.is_active ?? true
    }));
  } catch (error) {
    console.error('Error fetching cost centers:', error);
    throw error;
  }
};

/**
 * Validate expense against policy
 */
export const validateExpenseAgainstPolicy = async (expense: Partial<ExpenseItem>): Promise<{ isValid: boolean; violations: string[] }> => {
  try {
    const violations: string[] = [];

    // Basic validation rules
    if (expense.amount && expense.amount > 1000) {
      violations.push('Ausgaben über 1.000€ erfordern eine Genehmigung');
    }

    if (expense.category === 'entertainment' && expense.amount && expense.amount > 100) {
      violations.push('Bewirtungskosten über 100€ erfordern einen Beleg');
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  } catch (error) {
    console.error('Error validating expense:', error);
    throw error;
  }
};

/**
 * Get expense summary
 */
export const getExpenseSummary = async (userId?: string, dateFrom?: string, dateTo?: string): Promise<ExpenseSummary> => {
  try {
    let query = supabase
      .from('expenses')
      .select('status, amount, currency');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('date', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching expense summary:', error);
      throw error;
    }

    const expenses = data || [];
    
    const summary: ExpenseSummary = {
      totalExpenses: expenses.length,
      pendingApproval: expenses.filter(e => e.status === 'pending').length,
      approved: expenses.filter(e => e.status === 'approved').length,
      rejected: expenses.filter(e => e.status === 'rejected').length,
      totalAmount: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
      currency: 'EUR'
    };

    return summary;
  } catch (error) {
    console.error('Error getting expense summary:', error);
    throw error;
  }
};
