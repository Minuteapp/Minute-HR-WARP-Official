import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Clock, XCircle } from 'lucide-react';

interface TalentPoolKPICardsProps {
  totalCount: number;
  activeCount: number;
  expiringCount: number;
  expiredCount: number;
}

const TalentPoolKPICards = ({ totalCount, activeCount, expiringCount, expiredCount }: TalentPoolKPICardsProps) => {
  const kpis = [
    {
      title: 'Gesamt Kandidaten',
      value: totalCount,
      icon: Users,
      iconColor: 'text-gray-500',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'DSGVO Aktiv',
      value: activeCount,
      icon: Shield,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Läuft ab (30 Tage)',
      value: expiringCount,
      icon: Clock,
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

export default TalentPoolKPICards;
