import { Card, CardContent } from '@/components/ui/card';
import { ListChecks, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface TasksStats {
  total: number;
  inProgress: number;
  blocked: number;
  completed: number;
}

interface TasksStatsCardsProps {
  stats: TasksStats;
}

const TasksStatsCards = ({ stats }: TasksStatsCardsProps) => {
  const cards = [
    {
      label: 'Gesamt',
      value: stats.total,
      icon: ListChecks,
      iconColor: 'text-gray-400'
    },
    {
      label: 'In Arbeit',
      value: stats.inProgress,
      icon: Clock,
      iconColor: 'text-blue-500'
    },
    {
      label: 'Blockiert',
      value: stats.blocked,
      icon: AlertCircle,
      iconColor: 'text-orange-500'
    },
    {
      label: 'Erledigt',
      value: stats.completed,
      icon: CheckCircle,
      iconColor: 'text-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.iconColor}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TasksStatsCards;
