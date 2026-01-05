import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InsightCard } from './InsightCard';
import { Sparkles } from 'lucide-react';

export const AIInsightsList = () => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['performance-ai-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_ai_insights')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Keine Insights vorhanden</h3>
        <p className="text-muted-foreground">
          Die KI hat noch keine Insights generiert.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <InsightCard 
          key={insight.id} 
          insight={{
            ...insight,
            priority: insight.priority as 'high' | 'medium' | 'info',
            insight_type: insight.insight_type as 'warning' | 'pattern' | 'suggestion' | 'summary'
          }} 
        />
      ))}
    </div>
  );
};
