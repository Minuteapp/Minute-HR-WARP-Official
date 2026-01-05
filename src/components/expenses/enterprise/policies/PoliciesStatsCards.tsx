import { Card, CardContent } from '@/components/ui/card';
import { FileText, AlertTriangle, TrendingUp } from 'lucide-react';

export interface PolicyStats {
  activePolicies: number;
  violations30Days: number;
  complianceRate: number;
}

interface PoliciesStatsCardsProps {
  stats: PolicyStats;
}

const PoliciesStatsCards = ({ stats }: PoliciesStatsCardsProps) => {
  const cards = [
    {
      title: 'Aktive Richtlinien',
      value: `${stats.activePolicies}`,
      icon: FileText,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Verstöße (30 Tage)',
      value: `${stats.violations30Days}`,
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'Compliance-Rate',
      value: `${stats.complianceRate.toFixed(1)}%`,
      icon: TrendingUp,
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
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PoliciesStatsCards;
