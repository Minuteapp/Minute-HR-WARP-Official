import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Clock, Users, TrendingUp, TrendingDown } from 'lucide-react';

export interface TrainingKPIData {
  overallCompletion: { percent: number; trend: number };
  completed: { value: number; required: number };
  overdue: { value: number };
  employeesWithGaps: { value: number };
}

interface TrainingKPICardsProps {
  data?: TrainingKPIData;
}

export const TrainingKPICards: React.FC<TrainingKPICardsProps> = ({ data }) => {
  const kpis = [
    {
      icon: CheckCircle,
      iconBg: 'bg-green-100 dark:bg-green-950/30',
      iconColor: 'text-green-600',
      title: 'Gesamt Erfüllung',
      value: data?.overallCompletion?.percent !== undefined ? `${data.overallCompletion.percent}%` : '--%',
      subtitle: data?.overallCompletion?.trend !== undefined ? (
        <span className={`flex items-center gap-1 text-xs ${data.overallCompletion.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {data.overallCompletion.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {data.overallCompletion.trend >= 0 ? '+' : ''}{data.overallCompletion.trend}% vs. Vormonat
        </span>
      ) : 'Keine Daten',
    },
    {
      icon: CheckCircle,
      iconBg: 'bg-blue-100 dark:bg-blue-950/30',
      iconColor: 'text-blue-600',
      title: 'Abgeschlossen',
      value: data?.completed?.value !== undefined ? data.completed.value.toString() : '--',
      subtitle: data?.completed?.required !== undefined ? `von ${data.completed.required} erforderlich` : 'Keine Daten',
    },
    {
      icon: AlertTriangle,
      iconBg: 'bg-red-100 dark:bg-red-950/30',
      iconColor: 'text-red-600',
      title: 'Überfällig',
      value: data?.overdue?.value !== undefined ? data.overdue.value.toString() : '--',
      subtitle: 'Schulungen',
    },
    {
      icon: Users,
      iconBg: 'bg-orange-100 dark:bg-orange-950/30',
      iconColor: 'text-orange-600',
      title: 'MA mit Lücken',
      value: data?.employeesWithGaps?.value !== undefined ? data.employeesWithGaps.value.toString() : '--',
      subtitle: 'benötigen Schulung',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${kpi.iconBg}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <div className="text-sm text-muted-foreground">{kpi.subtitle}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
