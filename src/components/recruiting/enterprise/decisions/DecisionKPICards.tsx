import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Send, CheckCircle } from 'lucide-react';

interface DecisionKPICardsProps {
  pendingCount: number;
  sentCount: number;
  hiredCount: number;
}

const DecisionKPICards = ({ pendingCount, sentCount, hiredCount }: DecisionKPICardsProps) => {
  const kpis = [
    {
      title: 'Offene Entscheidungen',
      value: pendingCount,
      icon: AlertCircle,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Versandte Angebote',
      value: sentCount,
      icon: Send,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Einstellungen',
      value: hiredCount,
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
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

export default DecisionKPICards;
