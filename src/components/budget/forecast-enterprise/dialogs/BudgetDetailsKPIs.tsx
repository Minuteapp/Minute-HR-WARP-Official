import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, FileText } from 'lucide-react';

interface BudgetDetailsKPIsProps {
  totalBudget: number;
  usedBudget: number;
  availableBudget: number;
  usedPercent: number;
  currency: string;
}

export const BudgetDetailsKPIs: React.FC<BudgetDetailsKPIsProps> = ({
  totalBudget,
  usedBudget,
  availableBudget,
  usedPercent,
  currency,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const kpis = [
    {
      title: 'Budget',
      value: formatCurrency(totalBudget),
      subtitle: currency,
      icon: DollarSign,
      bgClass: 'bg-primary/10',
      iconBgClass: 'bg-primary/20',
    },
    {
      title: 'Verbraucht (YTD)',
      value: formatCurrency(usedBudget),
      subtitle: `${usedPercent}% des Budgets`,
      icon: TrendingUp,
      bgClass: 'bg-muted',
      iconBgClass: 'bg-muted-foreground/10',
    },
    {
      title: 'Verfügbar',
      value: formatCurrency(availableBudget),
      subtitle: `${100 - usedPercent}% verbleibend`,
      icon: FileText,
      bgClass: 'bg-green-500/10',
      iconBgClass: 'bg-green-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className={kpi.bgClass}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 rounded-lg ${kpi.iconBgClass} flex items-center justify-center`}>
                <kpi.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
