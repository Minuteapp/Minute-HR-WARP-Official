import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const DeviationsKPICards = () => {
  const { data: deviations } = useQuery({
    queryKey: ['deviations-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_deviations')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const totalDeviation = deviations?.reduce((sum, d) => sum + (d.deviation_amount || 0), 0) || 0;
  const criticalCount = deviations?.filter(d => Math.abs(d.deviation_percent || 0) > 10).length || 0;
  
  // Find largest deviation
  const largestDeviation = deviations?.reduce((max, d) => 
    Math.abs(d.deviation_amount || 0) > Math.abs(max.deviation_amount || 0) ? d : max
  , { category: '-', deviation_amount: 0, deviation_percent: 0 });

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    if (Math.abs(value) >= 1000000) return `${prefix}€ ${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${prefix}€ ${(value / 1000).toFixed(0)}k`;
    return `${prefix}€ ${value.toFixed(0)}`;
  };

  const kpis = [
    {
      title: 'Gesamtabweichung Plan vs. Forecast',
      value: formatCurrency(totalDeviation),
      subtitle: totalDeviation !== 0 ? `↗ ${totalDeviation > 0 ? '+' : ''}${((totalDeviation / 10000000) * 100).toFixed(1)}% über Plan` : 'Im Plan',
      icon: TrendingUp,
      valueColor: totalDeviation > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      title: 'Kritische Abweichungen',
      value: `${criticalCount} Kategorien`,
      subtitle: '>10% Abweichung',
      icon: AlertTriangle,
      valueColor: 'text-foreground',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Größte Einzelabweichung',
      value: largestDeviation?.category || '-',
      subtitle: largestDeviation ? `${formatCurrency(largestDeviation.deviation_amount || 0)} (${largestDeviation.deviation_percent > 0 ? '+' : ''}${(largestDeviation.deviation_percent || 0).toFixed(1)}%)` : '-',
      icon: Target,
      valueColor: 'text-primary',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      highlight: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className={kpi.highlight ? 'border-primary/50 bg-primary/5' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className={`text-2xl font-bold ${kpi.valueColor}`}>{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
