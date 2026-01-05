import { Card, CardContent } from '@/components/ui/card';
import { Clock, Loader2, CheckCircle } from 'lucide-react';

export interface BillingStats {
  pending: { amount: number; employees: number };
  processing: { amount: number; employees: number };
  reimbursed: { amount: number; employees: number };
}

interface BillingStatsCardsProps {
  stats: BillingStats;
}

const BillingStatsCards = ({ stats }: BillingStatsCardsProps) => {
  const cards = [
    {
      title: 'Ausstehend',
      value: `€${stats.pending.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      subtitle: `${stats.pending.employees} Mitarbeiter`,
      icon: Clock,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'In Bearbeitung',
      value: `€${stats.processing.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      subtitle: `${stats.processing.employees} Mitarbeiter`,
      icon: Loader2,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Erstattet (30 Tage)',
      value: `€${stats.reimbursed.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      subtitle: `${stats.reimbursed.employees} Mitarbeiter`,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BillingStatsCards;
