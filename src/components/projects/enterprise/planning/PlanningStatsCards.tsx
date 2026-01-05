import { Card, CardContent } from '@/components/ui/card';
import { Target, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface PlanningStats {
  totalMilestones: number;
  upcomingMilestones: number;
  inProgressMilestones: number;
  completedMilestones: number;
}

interface PlanningStatsCardsProps {
  stats: PlanningStats;
}

const PlanningStatsCards = ({ stats }: PlanningStatsCardsProps) => {
  const cards = [
    {
      label: 'Gesamt Meilensteine',
      value: stats.totalMilestones,
      icon: Target,
      iconColor: 'text-gray-400'
    },
    {
      label: 'Kommende (30 Tage)',
      value: stats.upcomingMilestones,
      icon: Clock,
      iconColor: 'text-blue-500'
    },
    {
      label: 'In Arbeit',
      value: stats.inProgressMilestones,
      icon: AlertCircle,
      iconColor: 'text-orange-500'
    },
    {
      label: 'Abgeschlossen',
      value: stats.completedMilestones,
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

export default PlanningStatsCards;
