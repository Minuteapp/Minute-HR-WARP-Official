
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, CheckCircle, Wallet, TrendingUp } from 'lucide-react';

export interface CardStats {
  totalCards: number;
  activeCards: number;
  monthlyLimit: number;
  totalSpent: number;
  usagePercent: number;
}

interface CorporateCardsStatsCardsProps {
  stats: CardStats;
}

const CorporateCardsStatsCards = ({ stats }: CorporateCardsStatsCardsProps) => {
  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('de-DE')}`;
  };

  const cards = [
    {
      title: 'Karten gesamt',
      value: stats.totalCards.toString(),
      icon: CreditCard,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Aktive Karten',
      value: stats.activeCards.toString(),
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Monatliches Limit',
      value: formatCurrency(stats.monthlyLimit),
      icon: Wallet,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Ausgegeben',
      value: formatCurrency(stats.totalSpent),
      subtitle: `${stats.usagePercent}% genutzt`,
      icon: TrendingUp,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                {card.subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{card.subtitle}</p>
                )}
              </div>
              <div className={`${card.iconBg} ${card.iconColor} rounded-full p-3`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CorporateCardsStatsCards;
