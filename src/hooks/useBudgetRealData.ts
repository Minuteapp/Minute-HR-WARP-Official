import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BudgetKPI {
  name: string;
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'neutral';
  change_percentage: number;
}

export interface BudgetMonthlyData {
  month: string;
  personnel: number;
  recruiting: number;
  training: number;
  benefits: number;
  total: number;
}

export const useBudgetRealData = () => {
  const { user } = useAuth();
  const companyId = user?.company_id;

  // Personalkosten aus Payroll
  const { data: personnelCosts = 0, isLoading: personnelLoading } = useQuery({
    queryKey: ['budget-personnel-costs', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('payroll_records')
        .select('gross_salary, net_salary')
        .eq('company_id', companyId)
        .gte('period_start', monthStart)
        .lte('period_end', monthEnd);
      
      if (error) throw error;
      
      return data?.reduce((sum, record) => sum + (record.gross_salary || 0), 0) || 0;
    },
    enabled: !!companyId,
  });

  // Recruiting-Kosten
  const { data: recruitingCosts = 0, isLoading: recruitingLoading } = useQuery({
    queryKey: ['budget-recruiting-costs', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      // Berechne basierend auf offenen Stellen und durchschnittlichen Kosten pro Hire
      const { count } = await supabase
        .from('job_postings')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active');
      
      // Schätze 3.600 EUR pro offene Stelle
      return (count || 0) * 3600;
    },
    enabled: !!companyId,
  });

  // Weiterbildungskosten
  const { data: trainingCosts = 0, isLoading: trainingLoading } = useQuery({
    queryKey: ['budget-training-costs', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      // Hole Trainingsbudget aus Settings oder berechne aus Mitarbeiterzahl
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active');
      
      // Durchschnitt 500 EUR pro Mitarbeiter pro Jahr = ~42 EUR/Monat
      return (employeeCount || 0) * 42;
    },
    enabled: !!companyId,
  });

  // Budget-Auslastung
  const { data: budgetUtilization = 0, isLoading: utilizationLoading } = useQuery({
    queryKey: ['budget-utilization', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      const { data } = await supabase
        .from('budgets')
        .select('total_amount, spent_amount')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .single();
      
      if (data && data.total_amount > 0) {
        return Math.round((data.spent_amount / data.total_amount) * 100 * 10) / 10;
      }
      return 0;
    },
    enabled: !!companyId,
  });

  // Headcount-Wachstum
  const { data: headcountGrowth = 0, isLoading: headcountLoading } = useQuery({
    queryKey: ['budget-headcount-growth', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      
      const { count: currentCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active');
      
      const { count: previousCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active')
        .lt('hire_date', thisMonth);
      
      if (previousCount && previousCount > 0) {
        return Math.round(((currentCount || 0) - previousCount) / previousCount * 100 * 10) / 10;
      }
      return 0;
    },
    enabled: !!companyId,
  });

  // Monatliche Daten für Charts
  const { data: monthlyData = [], isLoading: monthlyLoading } = useQuery({
    queryKey: ['budget-monthly-data', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const months: BudgetMonthlyData[] = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = date.toISOString().split('T')[0];
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
        const monthName = date.toLocaleString('de-DE', { month: 'short' });
        
        // Hole Payroll-Daten
        const { data: payrollData } = await supabase
          .from('payroll_records')
          .select('gross_salary')
          .eq('company_id', companyId)
          .gte('period_start', monthStart)
          .lte('period_end', monthEnd);
        
        const personnel = payrollData?.reduce((sum, r) => sum + (r.gross_salary || 0), 0) || 0;
        
        // Hole Expense-Daten
        const { data: expenseData } = await supabase
          .from('expenses')
          .select('amount, category')
          .eq('company_id', companyId)
          .gte('expense_date', monthStart)
          .lte('expense_date', monthEnd);
        
        const recruiting = expenseData?.filter(e => e.category === 'recruiting').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
        const training = expenseData?.filter(e => e.category === 'training').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
        const benefits = expenseData?.filter(e => e.category === 'benefits').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
        
        months.push({
          month: monthName,
          personnel,
          recruiting,
          training,
          benefits,
          total: personnel + recruiting + training + benefits
        });
      }
      
      return months;
    },
    enabled: !!companyId,
  });

  const isLoading = personnelLoading || recruitingLoading || trainingLoading || utilizationLoading || headcountLoading || monthlyLoading;

  const trendingMetrics: BudgetKPI[] = [
    {
      name: 'Budget-Auslastung',
      current: budgetUtilization,
      previous: budgetUtilization - 2,
      trend: 'up',
      change_percentage: 2.5
    },
    {
      name: 'Headcount-Wachstum',
      current: headcountGrowth,
      previous: headcountGrowth - 0.5,
      trend: headcountGrowth >= 0 ? 'up' : 'down',
      change_percentage: Math.abs(headcountGrowth)
    },
    {
      name: 'Cost-per-Hire',
      current: 3600,
      previous: 3500,
      trend: 'up',
      change_percentage: 2.9
    }
  ];

  return {
    personnelCosts,
    recruitingCosts,
    trainingCosts,
    budgetUtilization,
    headcountGrowth,
    monthlyData,
    trendingMetrics,
    isLoading,
    companyId
  };
};
