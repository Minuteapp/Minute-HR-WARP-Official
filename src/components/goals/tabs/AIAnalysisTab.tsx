import { useState, useEffect } from 'react';
import { AIInsight } from '@/types/goals-statistics';
import { goalsStatisticsService } from '@/services/goalsStatisticsService';
import { AIInsightCard } from '../components/AIInsightCard';
import { Sparkles } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const AIAnalysisTab = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await goalsStatisticsService.getAIInsights('current-user');
      setInsights(data);
    } catch (error) {
      console.error('Fehler beim Laden der KI-Analysen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (insightId: string) => {
    console.log('Aktion durchführen für Insight:', insightId);
    // Hier könnten weitere Aktionen implementiert werden
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="bg-gradient-to-r from-[#0066FF]/10 to-purple-50 rounded-xl p-6 border border-[#0066FF]/20">
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 text-[#0066FF] mt-0.5" />
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              🤖 KI-gestützte Zielanalyse
            </h2>
            <p className="text-sm text-muted-foreground">
              Die KI analysiert kontinuierlich Ihre Ziele, erkennt Muster, bewertet 
              Plausibilität und gibt Handlungsempfehlungen zur Verbesserung der 
              Zielerreichung und Ressourcenallokation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <AIInsightCard 
            key={insight.id} 
            insight={insight}
            onAction={handleAction}
          />
        ))}
      </div>
    </div>
  );
};
