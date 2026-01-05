import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AIForecastHeader } from "../aiforecast/AIForecastHeader";
import { AISettingsBox } from "../aiforecast/AISettingsBox";
import { AIKPICards } from "../aiforecast/AIKPICards";
import { AIInsightsList } from "../aiforecast/AIInsightsList";
import { AICapabilitiesGrid } from "../aiforecast/AICapabilitiesGrid";

export const AIInsightsForecastsTab = () => {
  const { data: insightCounts = { critical: 0, warnings: 0, forecasts: 0 } } = useQuery({
    queryKey: ['goal-ai-insights-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_ai_insights')
        .select('insight_type')
        .eq('is_resolved', false);
      
      if (error) throw error;

      const insights = data || [];
      return {
        critical: insights.filter(i => i.insight_type === 'critical').length,
        warnings: insights.filter(i => i.insight_type === 'warning').length,
        forecasts: insights.filter(i => i.insight_type === 'forecast').length
      };
    },
  });

  return (
    <div className="space-y-6">
      <AIForecastHeader />
      
      <AISettingsBox />

      <AIKPICards
        critical={insightCounts.critical}
        warnings={insightCounts.warnings}
        forecasts={insightCounts.forecasts}
      />

      <AIInsightsList />

      <AICapabilitiesGrid />
    </div>
  );
};
