import { FolderOpen, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ReportsStatsCardsProps {
  activeProjects: number;
  onTrack: number;
  atRisk: number;
  avgProgress: number;
}

const ReportsStatsCards = ({ activeProjects, onTrack, atRisk, avgProgress }: ReportsStatsCardsProps) => {
  const stats = [
    {
      label: 'Aktive Projekte',
      value: activeProjects.toString(),
      icon: FolderOpen,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'On Track',
      value: onTrack.toString(),
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'At Risk',
      value: atRisk.toString(),
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      label: 'Ø Fortschritt',
      value: `${avgProgress}%`,
      icon: TrendingUp,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReportsStatsCards;
