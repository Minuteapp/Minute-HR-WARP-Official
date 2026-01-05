import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertTriangle, DollarSign, Timer } from 'lucide-react';

export interface ApprovalStats {
  pending: number;
  highPriority: number;
  totalAmount: number;
  avgProcessingDays: number;
}

interface ApprovalsStatsCardsProps {
  stats: ApprovalStats;
}

const ApprovalsStatsCards = ({ stats }: ApprovalsStatsCardsProps) => {
  const cards = [
    {
      title: 'Ausstehend',
      value: `${stats.pending}`,
      subtitle: 'Genehmigungen',
      icon: Clock,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Hohe Priorität',
      value: `${stats.highPriority}`,
      subtitle: '',
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'Gesamtbetrag',
      value: `€${stats.totalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      subtitle: '',
      icon: DollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Bearbeitungszeit',
      value: `${stats.avgProcessingDays.toFixed(1)} Tage`,
      subtitle: '',
      icon: Timer,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-xl font-semibold text-foreground">{card.value}</p>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ApprovalsStatsCards;
