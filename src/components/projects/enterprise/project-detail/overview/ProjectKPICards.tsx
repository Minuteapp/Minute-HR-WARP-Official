
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, CheckCircle, Users } from "lucide-react";

interface ProjectKPICardsProps {
  project: any;
}

export const ProjectKPICards = ({ project }: ProjectKPICardsProps) => {
  const progress = project.progress || 0;
  const budgetSpent = project.budget_spent || 0;
  const budgetPlanned = project.budget || 0;
  const budgetProgress = budgetPlanned > 0 ? (budgetSpent / budgetPlanned) * 100 : 0;

  const kpis = [
    {
      label: 'Fortschritt',
      value: `${progress}%`,
      progress: progress,
      icon: TrendingUp,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Budget',
      value: `€${(budgetSpent / 1000).toFixed(0)}k`,
      subtitle: `von €${(budgetPlanned / 1000).toFixed(0)}k`,
      progress: budgetProgress,
      icon: DollarSign,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-100',
    },
    {
      label: 'Aufgaben',
      value: project.tasks_open || 0,
      subtitle: `von ${project.tasks_total || 0} offen`,
      badge: project.tasks_blocked ? `${project.tasks_blocked} blockiert` : null,
      icon: CheckCircle,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-100',
    },
    {
      label: 'Team',
      value: project.team_member_count || 0,
      subtitle: 'Mitglieder',
      icon: Users,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    {kpi.badge && (
                      <Badge className="bg-green-500 text-white text-xs hover:bg-green-500">
                        {kpi.badge}
                      </Badge>
                    )}
                  </div>
                  {kpi.subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">{kpi.subtitle}</p>
                  )}
                  {kpi.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={kpi.progress} className="h-2" />
                    </div>
                  )}
                </div>
                <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                  <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
