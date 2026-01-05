import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, CheckCircle2, Play, Euro, Loader2, Leaf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const MeasuresKPICards = () => {
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ['esg-measures-kpis'],
    queryFn: async () => {
      const { data: measures } = await supabase
        .from('esg_measures')
        .select('*');

      if (!measures || measures.length === 0) {
        return null;
      }

      const completed = measures.filter((m: any) => m.status === 'completed');
      const inProgress = measures.filter((m: any) => m.status === 'in-progress');
      
      const totalPotential = measures.reduce((sum: number, m: any) => sum + (Number(m.co2_reduction) || 0), 0);
      const achievedReduction = completed.reduce((sum: number, m: any) => sum + (Number(m.co2_reduction) || 0), 0);
      const totalInvestment = measures.reduce((sum: number, m: any) => sum + (Number(m.investment) || 0), 0);

      return {
        totalPotential: Math.round(totalPotential * 10) / 10,
        achievedReduction: Math.round(achievedReduction * 10) / 10,
        inProgressCount: inProgress.length,
        completedCount: completed.length,
        totalCount: measures.length,
        totalInvestment,
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-center h-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!kpiData) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <Leaf className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Keine Maßnahmen für KPI-Berechnung vorhanden</p>
        </div>
      </Card>
    );
  }

  const kpis = [
    {
      icon: TrendingDown,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Gesamt-Potenzial',
      value: `${kpiData.totalPotential}`,
      unit: 't CO₂e',
      subtitle: `${kpiData.totalCount} Maßnahmen definiert`,
    },
    {
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Bereits erreicht',
      value: `${kpiData.achievedReduction}`,
      unit: 't CO₂e',
      subtitle: `${kpiData.completedCount} abgeschlossen`,
    },
    {
      icon: Play,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'In Umsetzung',
      value: `${kpiData.inProgressCount}`,
      unit: '',
      subtitle: 'Aktive Projekte',
    },
    {
      icon: Euro,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      title: 'Gesamt-Invest',
      value: kpiData.totalInvestment > 0 ? `€${(kpiData.totalInvestment / 1000).toFixed(0)}k` : '€0',
      unit: '',
      subtitle: 'Über alle Maßnahmen',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${kpi.iconBg} rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold text-foreground">
                  {kpi.value} <span className="text-base font-normal">{kpi.unit}</span>
                </p>
                <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
