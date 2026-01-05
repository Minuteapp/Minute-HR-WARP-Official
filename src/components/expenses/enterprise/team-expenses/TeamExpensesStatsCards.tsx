
import { Card, CardContent } from '@/components/ui/card';
import { Layers, Building2, Users, Euro } from 'lucide-react';

interface TeamExpensesStats {
  divisions: number;
  departments: number;
  employees: number;
  totalExpenses: number;
}

interface TeamExpensesStatsCardsProps {
  stats?: TeamExpensesStats;
}

const TeamExpensesStatsCards = ({ stats }: TeamExpensesStatsCardsProps) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString('de-DE');
  };

  const formatCurrency = (num: number) => {
    if (num >= 1000000) {
      return `€${(num / 1000000).toFixed(2)} Mio`;
    }
    return `€${formatNumber(num)}`;
  };

  const cards = [
    {
      title: 'Divisionen',
      value: stats?.divisions ?? 0,
      icon: Layers,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Abteilungen gesamt',
      value: stats?.departments ?? 0,
      icon: Building2,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Mitarbeiter gesamt',
      value: formatNumber(stats?.employees ?? 0),
      icon: Users,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Ausgaben gesamt',
      value: formatCurrency(stats?.totalExpenses ?? 0),
      icon: Euro,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TeamExpensesStatsCards;
