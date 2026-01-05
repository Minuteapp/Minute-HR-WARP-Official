import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, TrendingUp, Activity, Zap, Plane, Recycle, Leaf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ESGKPICards = () => {
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ['esg-dashboard-kpis'],
    queryFn: async () => {
      // Lade Emissionsdaten
      const { data: emissions } = await supabase
        .from('esg_emissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!emissions || emissions.length === 0) {
        return null;
      }

      // Berechne Gesamt-Emissionen nach Scope
      const scopeData = { scope1: 0, scope2: 0, scope3: 0 };
      let totalEmissions = 0;

      emissions.forEach((e: any) => {
        const amount = Number(e.amount) || 0;
        totalEmissions += amount;
        if (e.scope === 'Scope 1') scopeData.scope1 += amount;
        else if (e.scope === 'Scope 2') scopeData.scope2 += amount;
        else if (e.scope === 'Scope 3') scopeData.scope3 += amount;
      });

      return {
        totalEmissions,
        scopeData,
        recordCount: emissions.length
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-lg mb-3"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!kpiData) {
    return (
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Leaf className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine ESG-Daten vorhanden</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Erfassen Sie Ihre ersten Emissionsdaten unter "Datenerfassung", um KPIs und Statistiken zu sehen.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const kpis = [
    {
      icon: Activity,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Gesamt-Emissionen',
      value: kpiData.totalEmissions.toLocaleString('de-DE', { maximumFractionDigits: 1 }),
      unit: 't CO₂e',
      details: [
        { label: 'Scope 1', value: `${kpiData.scopeData.scope1.toLocaleString('de-DE', { maximumFractionDigits: 1 })}t` },
        { label: 'Scope 2', value: `${kpiData.scopeData.scope2.toLocaleString('de-DE', { maximumFractionDigits: 1 })}t` },
        { label: 'Scope 3', value: `${kpiData.scopeData.scope3.toLocaleString('de-DE', { maximumFractionDigits: 1 })}t` }
      ]
    },
    {
      icon: Zap,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      title: 'Erfasste Datensätze',
      value: kpiData.recordCount.toString(),
      unit: 'Einträge',
      highlight: 'Basierend auf aktuellen Daten'
    },
    {
      icon: Plane,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Scope 3 Anteil',
      value: kpiData.totalEmissions > 0 
        ? ((kpiData.scopeData.scope3 / kpiData.totalEmissions) * 100).toFixed(1)
        : '0',
      unit: '%',
      highlight: 'Indirekte Emissionen'
    },
    {
      icon: Recycle,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Scope 1+2 Anteil',
      value: kpiData.totalEmissions > 0 
        ? (((kpiData.scopeData.scope1 + kpiData.scopeData.scope2) / kpiData.totalEmissions) * 100).toFixed(1)
        : '0',
      unit: '%',
      highlight: 'Direkte + Energie'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, index) => {
        const IconComponent = kpi.icon;
        
        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                  <IconComponent className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
              </div>
              
              <div className="mb-2">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{kpi.value}</span>
                  <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                </div>
              </div>
              
              {kpi.details && (
                <div className="flex gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                  {kpi.details.map((detail, i) => (
                    <span key={i}>
                      {detail.label}: {detail.value}
                    </span>
                  ))}
                </div>
              )}
              
              {kpi.highlight && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                  {kpi.highlight}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
