import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';

interface MonitoringKPICardsProps {
  runningCount: number;
  successCount: number;
  errorCount: number;
  avgDuration: number;
}

export const MonitoringKPICards = ({
  runningCount,
  successCount,
  errorCount,
  avgDuration
}: MonitoringKPICardsProps) => {
  const kpis = [
    {
      label: 'Laufend',
      value: runningCount,
      icon: Play,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Erfolgreich (24h)',
      value: successCount,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'Fehlgeschlagen',
      value: errorCount,
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      label: 'Ø Laufzeit',
      value: `${avgDuration.toFixed(1)}s`,
      icon: Clock,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${kpi.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
