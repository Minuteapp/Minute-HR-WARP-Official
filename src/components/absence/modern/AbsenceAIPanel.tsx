import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, TrendingUp, Sparkles, Info, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIInsight {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export const AbsenceAIPanel: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['absence-ai-analysis'],
    queryFn: async () => {
      const { data: companyId } = await supabase.rpc('get_effective_company_id');
      
      if (!companyId) {
        throw new Error('Keine Firma gefunden');
      }

      const { data, error } = await supabase.functions.invoke('absence-ai-analysis', {
        body: { companyId }
      });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 Minuten Cache
    refetchOnWindowFocus: false
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      case 'info':
      default:
        return TrendingUp;
    }
  };

  const getInsightColors = (type: string) => {
    switch (type) {
      case 'warning':
        return { iconColor: 'text-warning', bgColor: 'bg-warning/10' };
      case 'success':
        return { iconColor: 'text-success', bgColor: 'bg-success/10' };
      case 'info':
      default:
        return { iconColor: 'text-primary', bgColor: 'bg-primary/10' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Analysiere...</span>
      </div>
    );
  }

  if (error || !data?.insights) {
    // Fallback zu statischen Insights
    const fallbackInsights = [
      {
        id: 'info_1',
        type: 'info',
        title: 'AI-Analyse verfügbar',
        description: 'Aktivieren Sie die AI-Analyse für personalisierte Insights.'
      }
    ];

    return (
      <div className="space-y-3">
        {fallbackInsights.map((insight) => {
          const Icon = getInsightIcon(insight.type);
          const colors = getInsightColors(insight.type);
          return (
            <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg bg-card border hover:shadow-sm transition-shadow">
              <div className={`p-2 rounded-full ${colors.bgColor} flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${colors.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const insights: AIInsight[] = data.insights;

  return (
    <div className="space-y-3">
      {insights.length === 0 ? (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
          <div className="p-2 rounded-full bg-success/10 flex-shrink-0">
            <CheckCircle className="h-4 w-4 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">Alles in Ordnung</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Keine besonderen Vorkommnisse erkannt.</p>
          </div>
        </div>
      ) : (
        insights.slice(0, 5).map((insight) => {
          const Icon = getInsightIcon(insight.type);
          const colors = getInsightColors(insight.type);
          return (
            <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg bg-card border hover:shadow-sm transition-shadow">
              <div className={`p-2 rounded-full ${colors.bgColor} flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${colors.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
