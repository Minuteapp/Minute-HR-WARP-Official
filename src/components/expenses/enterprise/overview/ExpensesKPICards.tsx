
import { Card, CardContent } from '@/components/ui/card';
import { 
  Euro, 
  User, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  Globe, 
  AlertTriangle, 
  Brain 
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  trend?: { value: string; positive: boolean };
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
}

const KPICard = ({ title, value, trend, subtitle, icon, iconBgColor }: KPICardProps) => (
  <Card className="bg-card border-border">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{value}</span>
            {trend && (
              <span className={`text-sm flex items-center ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.positive ? '↗️' : '↘️'} {trend.value}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface ExpensesKPICardsProps {
  data?: {
    totalExpenses?: { value: number; trend: number; employees: number };
    avgPerEmployee?: { value: number; trend: number; previousMonth: number };
    pendingApprovals?: { value: number; trend: number; avgProcessingDays: number };
    activeCards?: { value: number; trend: number; cardVolume: number };
    budgetDeviation?: { percent: number; amount: number; costCenters: number };
    worldwideLocations?: { value: number; newLocations: number; countries: number; currencies: number };
    policyViolations?: { value: number; trend: number; percentOfTotal: number };
    aiAnomalies?: { value: number; trend: number; suspiciousAmount: number };
  };
}

const ExpensesKPICards = ({ data }: ExpensesKPICardsProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)} Mio`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  const row1Cards = [
    {
      title: 'Gesamtausgaben (Monat)',
      value: data?.totalExpenses?.value ? formatCurrency(data.totalExpenses.value) : '€0',
      trend: data?.totalExpenses?.trend ? { value: `+${data.totalExpenses.trend}%`, positive: true } : undefined,
      subtitle: `${data?.totalExpenses?.employees || 0} Mitarbeiter`,
      icon: <Euro className="h-5 w-5 text-purple-600" />,
      iconBgColor: 'bg-purple-100'
    },
    {
      title: 'Ø Ausgaben pro MA',
      value: data?.avgPerEmployee?.value ? `€${data.avgPerEmployee.value}` : '€0',
      trend: data?.avgPerEmployee?.trend ? { value: `+${data.avgPerEmployee.trend}%`, positive: true } : undefined,
      subtitle: `vs. €${data?.avgPerEmployee?.previousMonth || 0} Vormonat`,
      icon: <User className="h-5 w-5 text-purple-600" />,
      iconBgColor: 'bg-purple-100'
    },
    {
      title: 'Offene Genehmigungen',
      value: String(data?.pendingApprovals?.value || 0),
      trend: data?.pendingApprovals?.trend ? { value: `-${Math.abs(data.pendingApprovals.trend)}%`, positive: true } : undefined,
      subtitle: `Ø Bearbeitungszeit: ${data?.pendingApprovals?.avgProcessingDays || 0} Tage`,
      icon: <Clock className="h-5 w-5 text-yellow-600" />,
      iconBgColor: 'bg-yellow-100'
    },
    {
      title: 'Aktive Firmenkarten',
      value: String(data?.activeCards?.value || 0),
      trend: data?.activeCards?.trend ? { value: `+${data.activeCards.trend}`, positive: false } : undefined,
      subtitle: `${data?.activeCards?.cardVolume ? formatCurrency(data.activeCards.cardVolume) : '€0'} Kartenumsatz`,
      icon: <CreditCard className="h-5 w-5 text-pink-600" />,
      iconBgColor: 'bg-pink-100'
    }
  ];

  const row2Cards = [
    {
      title: 'Budgetabweichung',
      value: `+${data?.budgetDeviation?.percent || 0}%`,
      trend: data?.budgetDeviation?.amount ? { value: `€${data.budgetDeviation.amount} über Plan`, positive: false } : undefined,
      subtitle: `${data?.budgetDeviation?.costCenters || 0} Kostenstellen`,
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
      iconBgColor: 'bg-purple-100'
    },
    {
      title: 'Standorte weltweit',
      value: String(data?.worldwideLocations?.value || 0),
      trend: data?.worldwideLocations?.newLocations ? { value: `+${data.worldwideLocations.newLocations} neue`, positive: false } : undefined,
      subtitle: `${data?.worldwideLocations?.countries || 0} Länder, ${data?.worldwideLocations?.currencies || 0} Währungen`,
      icon: <Globe className="h-5 w-5 text-cyan-600" />,
      iconBgColor: 'bg-cyan-100'
    },
    {
      title: 'Richtlinienverstöße',
      value: String(data?.policyViolations?.value || 0),
      trend: data?.policyViolations?.trend ? { value: `+${data.policyViolations.trend}`, positive: false } : undefined,
      subtitle: `${data?.policyViolations?.percentOfTotal || 0}% aller Ausgaben`,
      icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
      iconBgColor: 'bg-orange-100'
    },
    {
      title: 'KI-erkannte Anomalien',
      value: String(data?.aiAnomalies?.value || 0),
      trend: data?.aiAnomalies?.trend ? { value: `+${data.aiAnomalies.trend}`, positive: false } : undefined,
      subtitle: `${data?.aiAnomalies?.suspiciousAmount ? formatCurrency(data.aiAnomalies.suspiciousAmount) : '€0'} verdächtig`,
      icon: <Brain className="h-5 w-5 text-cyan-600" />,
      iconBgColor: 'bg-cyan-100'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {row1Cards.map((card, index) => (
          <KPICard key={index} {...card} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {row2Cards.map((card, index) => (
          <KPICard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default ExpensesKPICards;
