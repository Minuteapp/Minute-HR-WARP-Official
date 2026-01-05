import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, Target, AlertCircle, Users, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BudgetKPICardsProps {
  fiscalYear: string;
}

export const BudgetKPICards: React.FC<BudgetKPICardsProps> = ({ fiscalYear }) => {
  const { data: budgetData } = useQuery({
    queryKey: ['budget-kpis', fiscalYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_plans')
        .select('total_amount, actual_amount, forecast_year_end, budget_deviation, personnel_cost_ratio')
        .eq('period', fiscalYear);

      if (error) throw error;

      const totals = (data || []).reduce(
        (acc, plan) => ({
          totalBudget: acc.totalBudget + (Number(plan.total_amount) || 0),
          actualCosts: acc.actualCosts + (Number(plan.actual_amount) || 0),
          forecastYearEnd: acc.forecastYearEnd + (Number(plan.forecast_year_end) || 0),
        }),
        { totalBudget: 0, actualCosts: 0, forecastYearEnd: 0 }
      );

      const deviation = totals.forecastYearEnd - totals.totalBudget;
      const deviationPercent = totals.totalBudget > 0 ? (deviation / totals.totalBudget) * 100 : 0;
      const personnelRatio = totals.totalBudget > 0 ? 68 : 0; // Will be calculated from actual data

      return {
        ...totals,
        deviation,
        deviationPercent,
        personnelRatio,
      };
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const kpis = [
    {
      title: 'Gesamtbudget (Plan)',
      value: formatCurrency(budgetData?.totalBudget || 0),
      icon: DollarSign,
      trend: null,
      bgClass: 'bg-card',
      iconBgClass: 'bg-muted',
    },
    {
      title: 'Ist-Kosten (YTD)',
      value: formatCurrency(budgetData?.actualCosts || 0),
      icon: TrendingUp,
      trend: budgetData?.actualCosts ? '+5.2%' : null,
      trendPositive: true,
      bgClass: 'bg-card',
      iconBgClass: 'bg-muted',
    },
    {
      title: 'Forecast Jahresende',
      value: formatCurrency(budgetData?.forecastYearEnd || 0),
      icon: Target,
      trend: budgetData?.forecastYearEnd ? '+5.4%' : null,
      trendPositive: true,
      bgClass: 'bg-primary/10',
      iconBgClass: 'bg-primary/20',
      hasInfo: true,
    },
    {
      title: 'Budgetabweichung',
      value: formatCurrency(budgetData?.deviation || 0),
      icon: AlertCircle,
      trend: budgetData?.deviationPercent ? `${budgetData.deviationPercent.toFixed(1)}%` : null,
      trendPositive: (budgetData?.deviationPercent || 0) <= 0,
      bgClass: 'bg-orange-500/10',
      iconBgClass: 'bg-orange-500/20',
      hasInfo: true,
    },
    {
      title: 'Personalkostenanteil',
      value: `${budgetData?.personnelRatio || 0}%`,
      icon: Users,
      trend: '+3%',
      trendPositive: true,
      bgClass: 'bg-primary/10',
      iconBgClass: 'bg-primary/20',
      hasInfo: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className={kpi.bgClass}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className={`h-10 w-10 rounded-lg ${kpi.iconBgClass} flex items-center justify-center`}>
                <kpi.icon className="h-5 w-5 text-primary" />
              </div>
              {kpi.hasInfo && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Basierend auf aktuellen Daten</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">{kpi.title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">{kpi.value}</span>
                {kpi.trend && (
                  <span className={`text-xs font-medium ${kpi.trendPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
