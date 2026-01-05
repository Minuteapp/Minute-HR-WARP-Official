import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AIInsightCard } from "./AIInsightCard";
import { useToast } from "@/hooks/use-toast";

export const AIInsightsList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['goal-ai-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_ai_insights')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goal_ai_insights')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-ai-insights'] });
      toast({
        title: "Insight aufgelöst",
        description: "Der Insight wurde als erledigt markiert.",
      });
    },
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Lade KI-Insights...</p>;
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Keine aktiven KI-Insights vorhanden.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight: any) => (
        <AIInsightCard
          key={insight.id}
          id={insight.id}
          insightType={insight.insight_type || 'warning'}
          category={insight.category || 'Risiko'}
          title={insight.title}
          description={insight.description || ''}
          confidenceScore={insight.confidence_score || 80}
          createdAt={insight.created_at}
          recommendations={insight.recommendations || []}
          onResolve={(id) => resolveMutation.mutate(id)}
          onDismiss={(id) => resolveMutation.mutate(id)}
        />
      ))}
    </div>
  );
};
