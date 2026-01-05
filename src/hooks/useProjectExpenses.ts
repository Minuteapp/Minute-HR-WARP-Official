
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectExpense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  status: string;
  submittedBy: string;
  submittedByName?: string;
}

export interface ProjectBudget {
  id: string;
  name: string;
  amount: number;
  usedAmount: number;
  remainingAmount: number;
  currency: string;
}

export interface ExpensesByCategory {
  category: string;
  total: number;
  percentage: number;
}

export const useProjectExpenses = (projectId: string) => {
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [budget, setBudget] = useState<ProjectBudget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadExpenses = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      // Lade Ausgaben für dieses Projekt aus der expenses Tabelle
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          id,
          description,
          amount,
          currency,
          category,
          date,
          status,
          submitted_by,
          user_id
        `)
        .eq('project_id', projectId)
        .order('date', { ascending: false });

      if (expensesError) {
        console.error('Error loading expenses:', expensesError);
        setError('Fehler beim Laden der Ausgaben');
        return;
      }

      // Lade Benutzernamen für die Ausgaben
      const userIds = [...new Set((expensesData || []).map(e => e.submitted_by || e.user_id).filter(Boolean))];
      let userMap: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        if (profiles) {
          userMap = profiles.reduce((acc, p) => {
            acc[p.id] = p.full_name || 'Unbekannt';
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // Transformiere zu ProjectExpense Format
      const transformedExpenses: ProjectExpense[] = (expensesData || []).map(exp => ({
        id: exp.id,
        description: exp.description || '',
        amount: exp.amount || 0,
        currency: exp.currency || 'EUR',
        category: exp.category || 'Sonstiges',
        date: exp.date || '',
        status: exp.status || 'pending',
        submittedBy: exp.submitted_by || exp.user_id || '',
        submittedByName: userMap[exp.submitted_by || exp.user_id || ''] || 'Unbekannt'
      }));

      setExpenses(transformedExpenses);

      // Lade Budget für dieses Projekt
      const { data: budgetData, error: budgetError } = await supabase
        .from('budget_plans')
        .select('*')
        .eq('type', 'project')
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (budgetError) {
        console.warn('Error loading budget:', budgetError);
      }

      if (budgetData) {
        setBudget({
          id: budgetData.id,
          name: budgetData.name,
          amount: budgetData.amount || 0,
          usedAmount: budgetData.used_amount || 0,
          remainingAmount: budgetData.remaining_amount || 0,
          currency: budgetData.currency || 'EUR'
        });
      } else {
        // Standard-Budget wenn keines definiert
        const totalSpent = transformedExpenses.reduce((sum, e) => sum + e.amount, 0);
        setBudget({
          id: 'default',
          name: 'Projektbudget',
          amount: 5000,
          usedAmount: totalSpent,
          remainingAmount: 5000 - totalSpent,
          currency: 'EUR'
        });
      }

    } catch (err) {
      console.error('Error in loadExpenses:', err);
      setError('Unerwarteter Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createExpense = async (expenseData: {
    description: string;
    amount: number;
    currency: string;
    category: string;
    date: string;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        toast({
          title: 'Fehler',
          description: 'Sie müssen angemeldet sein, um Ausgaben zu erstellen.',
          variant: 'destructive'
        });
        return null;
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          project_id: projectId,
          description: expenseData.description,
          amount: expenseData.amount,
          currency: expenseData.currency,
          category: expenseData.category,
          date: expenseData.date,
          status: 'pending',
          user_id: userData.user.id,
          submitted_by: userData.user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        toast({
          title: 'Fehler',
          description: 'Ausgabe konnte nicht erstellt werden.',
          variant: 'destructive'
        });
        return null;
      }

      toast({
        title: 'Erfolg',
        description: 'Ausgabe erfolgreich erstellt.'
      });

      // Aktualisiere die Liste
      await loadExpenses();
      return data;

    } catch (err) {
      console.error('Error in createExpense:', err);
      toast({
        title: 'Fehler',
        description: 'Unerwarteter Fehler beim Erstellen.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const getExpensesByCategory = (): ExpensesByCategory[] => {
    const categoryTotals: Record<string, number> = {};
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    expenses.forEach(exp => {
      const cat = exp.category || 'Sonstiges';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
    });

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      percentage: totalAmount > 0 ? (total / totalAmount) * 100 : 0
    }));
  };

  const getTotalExpenses = () => expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const getPendingExpenses = () => expenses
    .filter(e => e.status === 'pending' || e.status === 'submitted')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const getApprovedExpenses = () => expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  return {
    expenses,
    budget,
    loading,
    error,
    createExpense,
    refreshExpenses: loadExpenses,
    getExpensesByCategory,
    getTotalExpenses,
    getPendingExpenses,
    getApprovedExpenses
  };
};
