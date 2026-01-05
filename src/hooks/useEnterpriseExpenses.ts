import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  EnterpriseExpense, 
  ExpenseFilter, 
  ExpenseDashboardStats, 
  CostCenter, 
  ExpenseCategory, 
  Supplier,
  BudgetVarianceAnalysis,
  ExpenseAnalytics
} from '@/types/enterprise-expenses';

export const useEnterpriseExpenses = () => {
  const [expenses, setExpenses] = useState<EnterpriseExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchExpenses = async (filters?: ExpenseFilter) => {
    try {
      setLoading(true);
      let query = supabase
        .from('expenses')
        .select(`
          *,
          cost_center:cost_centers(code, name),
          category:expense_categories(code, name, color_code),
          supplier:suppliers(name),
          budget_plan:budget_plans(name)
        `)
        .order('date', { ascending: false });

      // Apply filters
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.cost_center_id) {
        query = query.eq('cost_center_id', filters.cost_center_id);
      }
      if (filters?.date_from) {
        query = query.gte('date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('date', filters.date_to);
      }
      if (filters?.amount_min) {
        query = query.gte('amount', filters.amount_min);
      }
      if (filters?.amount_max) {
        query = query.lte('amount', filters.amount_max);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`description.ilike.%${filters.search}%,invoice_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Fehler',
        description: 'Ausgaben konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (expenseData: Partial<EnterpriseExpense>) => {
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...expenseData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      // If linked to budget, create allocation
      if (expenseData.budget_plan_id && data) {
        await supabase
          .from('budget_expense_allocations')
          .insert([{
            expense_id: data.id,
            budget_plan_id: expenseData.budget_plan_id,
            allocated_amount: expenseData.amount || 0
          }]);
      }

      toast({
        title: 'Erfolgreich',
        description: 'Ausgabe wurde erstellt.',
      });

      await fetchExpenses();
      return data;
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: 'Fehler',
        description: 'Ausgabe konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateExpense = async (id: string, updates: Partial<EnterpriseExpense>) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Erfolgreich',
        description: 'Ausgabe wurde aktualisiert.',
      });

      await fetchExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: 'Fehler',
        description: 'Ausgabe konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Erfolgreich',
        description: 'Ausgabe wurde gelöscht.',
      });

      await fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Fehler',
        description: 'Ausgabe konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
    }
  };

  const approveExpense = async (id: string, comments?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          approval_chain: [
            { 
              action: 'approved', 
              by: user?.id, 
              at: new Date().toISOString(),
              comments 
            }
          ]
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Erfolgreich',
        description: 'Ausgabe wurde genehmigt.',
      });

      await fetchExpenses();
    } catch (error) {
      console.error('Error approving expense:', error);
      toast({
        title: 'Fehler',
        description: 'Ausgabe konnte nicht genehmigt werden.',
        variant: 'destructive',
      });
    }
  };

  const rejectExpense = async (id: string, reason: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'rejected',
          approval_chain: [
            { 
              action: 'rejected', 
              by: user?.id, 
              at: new Date().toISOString(),
              reason 
            }
          ]
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Erfolgreich',
        description: 'Ausgabe wurde abgelehnt.',
      });

      await fetchExpenses();
    } catch (error) {
      console.error('Error rejecting expense:', error);
      toast({
        title: 'Fehler',
        description: 'Ausgabe konnte nicht abgelehnt werden.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    loading,
    saving,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
  };
};

export const useExpenseDashboard = () => {
  const [stats, setStats] = useState<ExpenseDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, status, date, category, cost_center_id, category_id')
        .gte('date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);

      if (!expenses) return;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const stats: ExpenseDashboardStats = {
        total_expenses: expenses.length,
        pending_approvals: expenses.filter(e => e.status === 'pending').length,
        this_month_total: expenses
          .filter(e => new Date(e.date).getMonth() === currentMonth)
          .reduce((sum, e) => sum + e.amount, 0),
        this_year_total: expenses.reduce((sum, e) => sum + e.amount, 0),
        budget_utilization: 0, // TODO: Calculate from budget plans
        top_categories: [], // TODO: Group by category
        top_cost_centers: [], // TODO: Group by cost center
        monthly_trend: [], // TODO: Calculate monthly trends
        overdue_payments: 0, // TODO: Calculate overdue
        upcoming_payments: 0, // TODO: Calculate upcoming
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    stats,
    loading,
    refetch: fetchDashboardStats,
  };
};

export const useCostCenters = () => {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCostCenters = async () => {
      try {
        const { data, error } = await supabase
          .from('cost_centers')
          .select('*')
          .eq('is_active', true)
          .order('code');

        if (error) throw error;
        setCostCenters(data || []);
      } catch (error) {
        console.error('Error fetching cost centers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCostCenters();
  }, []);

  return { costCenters, loading };
};

export const useExpenseCategories = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('expense_categories')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching expense categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setSuppliers(data || []);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  return { suppliers, loading };
};