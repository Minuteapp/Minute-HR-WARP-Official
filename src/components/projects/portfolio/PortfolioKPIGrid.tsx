import { TrendingUp, AlertTriangle, Clock, DollarSign, Users, Settings, XCircle, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Project {
  id: string;
  status: string;
  progress?: number;
  budget?: number;
  budget_spent?: number;
  priority?: string;
  end_date?: string;
  team_members?: string[];
}

interface PortfolioKPIGridProps {
  projects: Project[];
}

export const PortfolioKPIGrid = ({ projects }: PortfolioKPIGridProps) => {
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const atRiskProjects = projects.filter(p => p.status === 'at-risk').length;
  const delayedProjects = projects.filter(p => 
    p.status === 'delayed' || (p.end_date && new Date(p.end_date) < new Date() && p.status !== 'completed')
  ).length;

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.budget_spent || 0), 0);
  const budgetDeviation = totalBudget > 0 ? Math.round(((totalSpent - totalBudget) / totalBudget) * 100) : 0;

  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
    : 0;

  const criticalTeams = projects.filter(p => (p.team_members?.length || 0) < 2 && p.status === 'active').length;
  const teamUtilization = projects.length > 0 ? Math.round((criticalTeams / projects.length) * 100) : 0;

  const highPriorityProjects = projects.filter(p => p.priority === 'high').length;

  const kpis = [
    {
      label: 'Aktive Projekte',
      value: activeProjects.toString(),
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
    },
    {
      label: 'Projekte im Risiko',
      value: atRiskProjects.toString(),
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
    },
    {
      label: 'Projekte verspätet',
      value: delayedProjects.toString(),
      icon: Clock,
      color: 'text-red-600 bg-red-100 dark:bg-red-900/30'
    },
    {
      label: 'Budgetabweichung',
      value: `${budgetDeviation > 0 ? '+' : ''}${budgetDeviation}%`,
      icon: DollarSign,
      color: budgetDeviation > 0 ? 'text-red-600 bg-red-100 dark:bg-red-900/30' : 'text-green-600 bg-green-100 dark:bg-green-900/30'
    },
    {
      label: 'Ø Fortschritt',
      value: `${avgProgress}%`,
      icon: Target,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
    },
    {
      label: 'Kritische Teams',
      value: `${teamUtilization}%`,
      icon: Users,
      color: teamUtilization > 30 ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' : 'text-green-600 bg-green-100 dark:bg-green-900/30'
    },
    {
      label: 'High-Priority',
      value: highPriorityProjects.toString(),
      icon: Settings,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
    },
    {
      label: 'Blockierte',
      value: projects.filter(p => p.status === 'on-hold').length.toString(),
      icon: XCircle,
      color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
