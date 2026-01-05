import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AIInsightsKPICards = () => {
  const { data: insights } = useQuery({
    queryKey: ['performance-ai-insights-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_ai_insights')
        .select('priority');
      if (error) throw error;
      return data || [];
    }
  });

  const highPriority = insights?.filter(i => i.priority === 'high').length || 0;
  const mediumPriority = insights?.filter(i => i.priority === 'medium').length || 0;
  const patterns = insights?.filter(i => i.priority === 'info').length || 0;

  const kpis = [
    {
      icon: AlertCircle,
      value: highPriority,
      label: 'Hohe Priorität',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/30'
    },
    {
      icon: Lightbulb,
      value: mediumPriority,
      label: 'Mittlere Priorität',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30'
    },
    {
      icon: TrendingUp,
      value: patterns,
      label: 'Muster erkannt',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
