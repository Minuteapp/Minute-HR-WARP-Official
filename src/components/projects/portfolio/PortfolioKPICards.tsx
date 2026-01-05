import { Card, CardContent } from '@/components/ui/card';
import { Activity, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface PortfolioKPICardsProps {
  metrics: {
    activeProjects: { value: number; change: number };
    averageProgress: { value: number; change: number };
    budgetSpent: { value: number; change: number };
    riskIndex: { value: number; change: number };
    onTimeMilestones: { value: number; change: number };
    overdueTasks: { value: number; change: number };
  };
}

export const PortfolioKPICards = ({ metrics }: PortfolioKPICardsProps) => {
  const kpis = [
    {
      title: 'Aktive Projekte',
      value: metrics.activeProjects.value,
      change: metrics.activeProjects.change,
      icon: Activity,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      changeColor: metrics.activeProjects.change >= 0 ? 'text-green-600' : 'text-red-600',
      TrendIcon: metrics.activeProjects.change >= 0 ? TrendingUp : TrendingDown
    },
    {
      title: 'Fortschritt Ø',
      value: `${metrics.averageProgress.value}%`,
      change: `${metrics.averageProgress.change > 0 ? '+' : ''}${metrics.averageProgress.change}%`,
      icon: TrendingUp,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      changeColor: metrics.averageProgress.change >= 0 ? 'text-green-600' : 'text-red-600',
      TrendIcon: metrics.averageProgress.change >= 0 ? TrendingUp : TrendingDown
    },
    {
      title: 'Budgetverbrauch',
      value: `€${metrics.budgetSpent.value.toFixed(1)}M`,
      change: `${metrics.budgetSpent.change > 0 ? '+' : ''}${metrics.budgetSpent.change}%`,
      icon: DollarSign,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      changeColor: metrics.budgetSpent.change <= 0 ? 'text-green-600' : 'text-red-600',
      TrendIcon: metrics.budgetSpent.change >= 0 ? TrendingUp : TrendingDown
    },
    {
      title: 'Risikoindex',
      value: metrics.riskIndex.value.toFixed(1),
      change: `${metrics.riskIndex.change > 0 ? '+' : ''}${metrics.riskIndex.change}`,
      icon: AlertTriangle,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      changeColor: metrics.riskIndex.change <= 0 ? 'text-green-600' : 'text-red-600',
      TrendIcon: metrics.riskIndex.change >= 0 ? TrendingUp : TrendingDown
    },
    {
      title: 'Pünktliche Meilensteine',
      value: `${metrics.onTimeMilestones.value}%`,
      change: `${metrics.onTimeMilestones.change > 0 ? '+' : ''}${metrics.onTimeMilestones.change}%`,
      icon: CheckCircle,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      changeColor: metrics.onTimeMilestones.change >= 0 ? 'text-green-600' : 'text-red-600',
      TrendIcon: metrics.onTimeMilestones.change >= 0 ? TrendingUp : TrendingDown
    },
    {
      title: 'Überfällige Tasks',
      value: metrics.overdueTasks.value,
      change: `${metrics.overdueTasks.change > 0 ? '+' : ''}${metrics.overdueTasks.change}`,
      icon: Clock,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      changeColor: metrics.overdueTasks.change <= 0 ? 'text-green-600' : 'text-red-600',
      TrendIcon: metrics.overdueTasks.change >= 0 ? TrendingUp : TrendingDown
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                <p className="text-3xl font-bold">{kpi.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <kpi.TrendIcon className={`h-4 w-4 ${kpi.changeColor}`} />
                  <span className={`text-sm font-medium ${kpi.changeColor}`}>
                    {kpi.change}
                  </span>
                </div>
              </div>
              <div className={`p-2 ${kpi.iconBg} rounded-lg`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
