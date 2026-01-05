import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface ComplianceKPICardsProps {
  totalCount: number;
  withConsentCount: number;
  expiringCount: number;
  expiredCount: number;
}

const ComplianceKPICards = ({ totalCount, withConsentCount, expiringCount, expiredCount }: ComplianceKPICardsProps) => {
  const kpis = [
    {
      title: 'Gesamt Kandidaten',
      value: totalCount,
      icon: Shield,
      iconColor: 'text-gray-500',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Mit Einwilligung',
      value: withConsentCount,
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Läuft ab (30 Tage)',
      value: expiringCount,
      icon: AlertCircle,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Abgelaufen',
      value: expiredCount,
      icon: XCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ComplianceKPICards;
