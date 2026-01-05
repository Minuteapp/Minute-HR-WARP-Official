import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BudgetData {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  monthlyBudget: number;
  monthlySpent: number;
  trend: 'up' | 'down' | 'stable';
}

export const BudgetOverviewWidget: React.FC = () => {
  const [budgetData, setBudgetData] = useState<BudgetData>({
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
    monthlyBudget: 0,
    monthlySpent: 0,
    trend: 'stable'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        // Aktuelle Budget-Pläne laden
        const currentYear = new Date().getFullYear();
        const { data: budgetPlans, error: budgetError } = await supabase
          .from('budget_plans')
          .select('planned_amount')
          .gte('period_start', `${currentYear}-01-01`)
          .lte('period_end', `${currentYear}-12-31`);

        if (budgetError) throw budgetError;

        // Aktuelle Ausgaben laden
        const { data: expenses, error: expenseError } = await supabase
          .from('expenses')
          .select('amount, date')
          .gte('date', `${currentYear}-01-01`)
          .lte('date', `${currentYear}-12-31`);

        if (expenseError) throw expenseError;

        // Monatliche Ausgaben
        const currentMonth = new Date().getMonth() + 1;
        const monthlyExpenses = expenses?.filter(expense => {
          const expenseMonth = new Date(expense.date).getMonth() + 1;
          return expenseMonth === currentMonth;
        }) || [];

        const totalBudget = budgetPlans?.reduce((sum, plan) => sum + (plan.planned_amount || 0), 0) || 0;
        const totalSpent = expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
        const monthlySpent = monthlyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const monthlyBudget = totalBudget / 12; // Vereinfachte Berechnung

        // Trend berechnen (vereinfacht)
        const lastMonthSpent = expenses?.filter(expense => {
          const expenseMonth = new Date(expense.date).getMonth() + 1;
          return expenseMonth === currentMonth - 1;
        }).reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (monthlySpent > lastMonthSpent * 1.1) trend = 'up';
        else if (monthlySpent < lastMonthSpent * 0.9) trend = 'down';

        setBudgetData({
          totalBudget,
          totalSpent,
          remainingBudget: totalBudget - totalSpent,
          monthlyBudget,
          monthlySpent,
          trend
        });
      } catch (error) {
        console.error('Fehler beim Laden der Budget-Daten:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBudgetUtilization = () => {
    if (budgetData.totalBudget === 0) return 0;
    return (budgetData.totalSpent / budgetData.totalBudget) * 100;
  };

  const getTrendIcon = () => {
    switch (budgetData.trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Budget-Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const utilization = getBudgetUtilization();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Budget-Übersicht
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-lg font-bold">{formatCurrency(budgetData.remainingBudget)}</div>
            <div className="text-xs text-muted-foreground">Verfügbar</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{formatCurrency(budgetData.totalSpent)}</div>
            <div className="text-xs text-muted-foreground">Ausgegeben</div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Auslastung</span>
            <span>{utilization.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                utilization > 90 ? 'bg-red-500' : 
                utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">{formatCurrency(budgetData.monthlySpent)}</div>
            <div className="text-xs text-muted-foreground">Diesen Monat</div>
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className="text-xs">Trend</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};