// Compliance Hub - Arbeitszeit KPI-Karten
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Clock } from 'lucide-react';

export interface WorkingTimeKPIData {
  totalViolations: { value: number; weeklyDiff: number };
  criticalCases: { value: number };
  hotspotLocation: { name: string; count: number };
  mostFrequentType: { type: string; percent: number };
}

interface WorkingTimeKPICardsProps {
  data?: WorkingTimeKPIData;
}

export const WorkingTimeKPICards: React.FC<WorkingTimeKPICardsProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="bg-card">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Keine Daten</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-100 dark:bg-red-950/50',
      title: 'Verstöße gesamt',
      value: data.totalViolations.value,
      subtitle: data.totalViolations.weeklyDiff >= 0 
        ? `+${data.totalViolations.weeklyDiff} diese Woche`
        : `${data.totalViolations.weeklyDiff} diese Woche`,
      trend: data.totalViolations.weeklyDiff > 0 ? 'negative' : 'positive'
    },
    {
      icon: AlertTriangle,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-100 dark:bg-orange-950/50',
      title: 'Kritische Fälle',
      value: data.criticalCases.value,
      subtitle: 'benötigen Aktion',
      trend: null
    },
    {
      icon: TrendingUp,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-100 dark:bg-purple-950/50',
      title: 'Hotspot Standort',
      value: data.hotspotLocation.name,
      subtitle: `${data.hotspotLocation.count} Verstöße`,
      trend: null
    },
    {
      icon: Clock,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-100 dark:bg-blue-950/50',
      title: 'Häufigster Verstoß',
      value: data.mostFrequentType.type,
      subtitle: `${data.mostFrequentType.percent}%`,
      trend: null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                <p className={`text-xs mt-1 ${
                  kpi.trend === 'negative' ? 'text-red-500' : 
                  kpi.trend === 'positive' ? 'text-green-500' : 
                  'text-muted-foreground'
                }`}>
                  {kpi.subtitle}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
