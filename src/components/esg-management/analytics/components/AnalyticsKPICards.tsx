import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, Target, BarChart3, Leaf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AnalyticsKPICards = () => {
  // Lade echte ESG-KPI-Daten aus der Datenbank
  const { data: kpiData = [], isLoading } = useQuery({
    queryKey: ['esg-analytics-kpis'],
    queryFn: async () => {
      // Lade Emissionsdaten für Berechnungen
      const { data: emissions } = await supabase
        .from('esg_emissions')
        .select('*')
        .order('year', { ascending: true });

      if (!emissions || emissions.length === 0) {
        return [];
      }

      // Gruppiere nach Jahr
      const yearlyData = new Map<number, number>();
      emissions.forEach((e: any) => {
        const year = e.year || new Date(e.created_at).getFullYear();
        const current = yearlyData.get(year) || 0;
        yearlyData.set(year, current + (Number(e.amount) || 0));
      });

      const years = Array.from(yearlyData.keys()).sort();
      if (years.length === 0) return [];

      const firstYear = years[0];
      const lastYear = years[years.length - 1];
      const firstYearValue = yearlyData.get(firstYear) || 0;
      const lastYearValue = yearlyData.get(lastYear) || 0;

      // Berechne Reduktion
      const totalReduction = firstYearValue > 0 
        ? Math.round(((firstYearValue - lastYearValue) / firstYearValue) * 100) 
        : 0;

      // Berechne jährliche durchschnittliche Reduktion
      const yearsCount = years.length > 1 ? years.length - 1 : 1;
      const avgAnnualReduction = Math.round((totalReduction / yearsCount) * 10) / 10;

      // Lade Zielwert falls vorhanden
      const { data: targets } = await supabase
        .from('esg_targets')
        .select('*')
        .eq('year', lastYear)
        .single();

      const targetValue = targets?.target_value || 0;
      const targetAchievement = targetValue > 0 
        ? Math.round((1 - (lastYearValue / targetValue)) * 100 + 100) 
        : 0;

      return [
        {
          title: `Gesamtreduktion seit ${firstYear}`,
          value: totalReduction > 0 ? `-${totalReduction}%` : '0%',
          subtitle: `Von ${firstYearValue.toLocaleString('de-DE')} t auf ${lastYearValue.toLocaleString('de-DE')} t CO₂e`,
          icon: TrendingDown,
          bgColor: totalReduction > 0 ? 'bg-green-50' : 'bg-muted',
          iconBgColor: totalReduction > 0 ? 'bg-green-100' : 'bg-muted',
          iconColor: totalReduction > 0 ? 'text-green-600' : 'text-muted-foreground',
          valueColor: totalReduction > 0 ? 'text-green-600' : 'text-muted-foreground',
        },
        {
          title: 'Durchschnittliche jährliche Reduktion',
          value: avgAnnualReduction > 0 ? `-${avgAnnualReduction}%` : '0%',
          subtitle: `Pro Jahr (Ø ${firstYear}-${lastYear})`,
          icon: BarChart3,
          bgColor: 'bg-blue-50',
          iconBgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          valueColor: 'text-blue-600',
        },
        {
          title: `Zielerreichung ${lastYear}`,
          value: targetValue > 0 ? `${targetAchievement}%` : '-',
          subtitle: targetValue > 0 ? `Ziel: ${targetValue.toLocaleString('de-DE')} t` : 'Kein Ziel definiert',
          icon: Target,
          bgColor: targetAchievement >= 100 ? 'bg-green-50' : 'bg-yellow-50',
          iconBgColor: targetAchievement >= 100 ? 'bg-green-100' : 'bg-yellow-100',
          iconColor: targetAchievement >= 100 ? 'text-green-600' : 'text-yellow-600',
          valueColor: targetAchievement >= 100 ? 'text-green-600' : 'text-yellow-600',
        },
      ];
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-muted/30 border-0">
            <CardContent className="p-4">
              <div className="animate-pulse flex items-start gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-2 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (kpiData.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Leaf className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Keine Emissionsdaten für KPI-Berechnung vorhanden
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Erfassen Sie Emissionsdaten, um Analysen zu sehen
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpiData.map((kpi, index) => {
        const IconComponent = kpi.icon;
        return (
          <Card key={index} className={`${kpi.bgColor} border-0`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${kpi.iconBgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className={`text-2xl font-bold ${kpi.valueColor}`}>{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
