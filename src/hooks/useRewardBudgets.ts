import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RewardBudget, RewardTransaction, BudgetStatistics } from '@/types/reward-budgets';
import { format, startOfMonth, subMonths, startOfYear } from 'date-fns';
import { de } from 'date-fns/locale';

export const useRewardBudgets = () => {
  const currentYear = new Date().getFullYear();

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['reward-budgets', currentYear],
    queryFn: async (): Promise<RewardBudget[]> => {
      const { data, error } = await supabase
        .from('reward_budgets')
        .select('*')
        .eq('year', currentYear)
        .order('department');

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        total_budget: Number(item.total_budget),
        used_budget: Number(item.used_budget)
      }));
    }
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['reward-transactions'],
    queryFn: async (): Promise<RewardTransaction[]> => {
      const yearStart = startOfYear(new Date()).toISOString();
      
      const { data, error } = await supabase
        .from('reward_transactions')
        .select(`
          *,
          employee:profiles(display_name, avatar_url)
        `)
        .gte('transaction_date', yearStart.split('T')[0])
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return (data || []).map((item: any) => ({
        ...item,
        amount: Number(item.amount),
        employee_name: item.employee?.display_name || item.employee_name,
        employee_avatar: item.employee?.avatar_url
      }));
    }
  });

  const statistics: BudgetStatistics = (() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.total_budget, 0);
    const usedBudget = budgets.reduce((sum, b) => sum + b.used_budget, 0);
    const remainingBudget = totalBudget - usedBudget;
    const utilizationPercentage = totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0;

    // Monthly spend
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthTransactions = transactions.filter(t => 
      new Date(t.transaction_date) >= thisMonthStart
    );
    const monthlySpend = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Average per employee (estimate based on unique employees)
    const uniqueEmployees = new Set(transactions.map(t => t.employee_id).filter(Boolean)).size;
    const avgPerEmployee = uniqueEmployees > 0 ? Math.round(usedBudget / uniqueEmployees) : 0;

    // Largest expense
    const largestTransaction = transactions.reduce((max, t) => 
      t.amount > (max?.amount || 0) ? t : max, 
      transactions[0]
    );
    const largestExpense = largestTransaction 
      ? { name: largestTransaction.reward_name, amount: largestTransaction.amount }
      : { name: '-', amount: 0 };

    // Year-end forecast
    const monthsElapsed = now.getMonth() + 1;
    const yearEndForecast = monthsElapsed > 0 
      ? Math.round((usedBudget / monthsElapsed) * 12)
      : usedBudget;

    // Department budgets
    const departmentBudgets = budgets.map(b => ({
      department: b.department,
      totalBudget: b.total_budget,
      usedBudget: b.used_budget,
      percentage: b.total_budget > 0 ? Math.round((b.used_budget / b.total_budget) * 100) : 0,
      color: b.color || '#3b82f6'
    }));

    // Monthly expenses (last 6 months)
    const monthlyExpenses: Array<{ month: string; amount: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = startOfMonth(subMonths(monthDate, -1));
      
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.transaction_date);
        return date >= monthStart && date < monthEnd;
      });
      
      monthlyExpenses.push({
        month: format(monthDate, 'MMM', { locale: de }),
        amount: monthTransactions.reduce((sum, t) => sum + t.amount, 0)
      });
    }

    // Category distribution
    const categoryTotals: Record<string, number> = {};
    transactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    const totalCategoryAmount = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const categoryDistribution = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalCategoryAmount > 0 ? Math.round((amount / totalCategoryAmount) * 100) : 0
    }));

    return {
      totalBudget,
      usedBudget,
      remainingBudget,
      utilizationPercentage,
      monthlySpend,
      avgPerEmployee,
      largestExpense,
      yearEndForecast,
      departmentBudgets,
      monthlyExpenses,
      categoryDistribution
    };
  })();

  return {
    budgets,
    transactions,
    statistics,
    isLoading: budgetsLoading || transactionsLoading
  };
};
