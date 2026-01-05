import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InsightCard } from './InsightCard';
import { Skeleton } from '@/components/ui/skeleton';

export const InsightsList: React.FC = () => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['ai-budget-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_budget_insights')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const mapSeverityToType = (severity: string): 'warning' | 'opportunity' | 'info' => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'warning';
      case 'low':
        return 'opportunity';
      default:
        return 'info';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine KI-Insights vorhanden.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Aktuelle Insights</h3>
      {insights.map((insight) => (
        <InsightCard
          key={insight.id}
          title={insight.title}
          type={mapSeverityToType(insight.severity || 'medium')}
          confidence={Math.round((Number(insight.confidence_score) || 0.8) * 100)}
          description={insight.description}
          impact={insight.impact_amount ? `€ ${Number(insight.impact_amount).toLocaleString('de-DE')}` : undefined}
          recommendation={insight.recommendation || undefined}
        />
      ))}
    </div>
  );
};
