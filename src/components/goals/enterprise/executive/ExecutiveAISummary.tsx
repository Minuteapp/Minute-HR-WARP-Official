import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { ExecutiveInsightRow } from "./ExecutiveInsightRow";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ExecutiveAISummary = () => {
  const { data: insights = [] } = useQuery({
    queryKey: ['goal-ai-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Sparkles className="h-5 w-5" />
          KI Executive Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine KI-Insights vorhanden. Insights werden automatisch generiert, sobald Ziele hinzugefügt werden.
          </p>
        ) : (
          <div className="space-y-1 divide-y">
            {insights.map((insight) => (
              <ExecutiveInsightRow
                key={insight.id}
                priority={insight.priority}
                title={insight.title}
                description={insight.description || undefined}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
