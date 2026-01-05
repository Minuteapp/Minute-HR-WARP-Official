
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  Target
} from 'lucide-react';

interface PortfolioMetricsProps {
  metrics?: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    delayedProjects: number;
    totalBudget: number;
    budgetSpent: number;
    averageProgress: number;
    teamMembers: number;
  };
}

export const PortfolioMetrics: React.FC<PortfolioMetricsProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricsData = [
    {
      title: 'Gesamtprojekte',
      value: metrics.totalProjects,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: null
    },
    {
      title: 'Aktive Projekte',
      value: metrics.activeProjects,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: null
    },
    {
      title: 'Abgeschlossen',
      value: metrics.completedProjects,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: null
    },
    {
      title: 'Verspätet',
      value: metrics.delayedProjects,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: null
    },
    {
      title: 'Gesamtbudget',
      value: `€${metrics.totalBudget.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: null
    },
    {
      title: 'Budget verwendet',
      value: `€${metrics.budgetSpent.toLocaleString()}`,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: `${((metrics.budgetSpent / metrics.totalBudget) * 100).toFixed(1)}%`
    },
    {
      title: 'Ø Fortschritt',
      value: `${metrics.averageProgress.toFixed(1)}%`,
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: null
    },
    {
      title: 'Team-Mitglieder',
      value: metrics.teamMembers,
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      change: null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {metric.value}
                  </p>
                  {metric.change && (
                    <Badge variant="secondary" className="text-xs">
                      {metric.change}
                    </Badge>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
