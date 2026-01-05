import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

interface ResourceStats {
  totalMembers: number;
  averageUtilization: number;
  overloaded: number;
  available: number;
  weeklyCosts: number;
}

interface ResourcesStatsCardsProps {
  stats: ResourceStats;
}

const ResourcesStatsCards = ({ stats }: ResourcesStatsCardsProps) => {
  const cards = [
    {
      label: 'Team-Mitglieder',
      value: stats.totalMembers.toString(),
      icon: Users,
      iconColor: 'text-muted-foreground'
    },
    {
      label: 'Ø Auslastung',
      value: `${stats.averageUtilization}%`,
      icon: TrendingUp,
      iconColor: 'text-blue-500'
    },
    {
      label: 'Überausgelastet',
      value: stats.overloaded.toString(),
      icon: AlertTriangle,
      iconColor: 'text-orange-500'
    },
    {
      label: 'Verfügbar',
      value: stats.available.toString(),
      icon: Users,
      iconColor: 'text-green-500'
    },
    {
      label: 'Wochenkosten',
      value: `€${stats.weeklyCosts >= 1000 ? `${(stats.weeklyCosts / 1000).toFixed(0)}k` : stats.weeklyCosts}`,
      icon: DollarSign,
      iconColor: 'text-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.iconColor}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResourcesStatsCards;
