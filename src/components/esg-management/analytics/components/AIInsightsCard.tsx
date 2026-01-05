import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle, AlertTriangle, Loader2, Leaf } from 'lucide-react';
import { useCompanyId } from '@/hooks/useCompanyId';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Insight {
  type: 'positive' | 'warning';
  text: string;
}

const renderText = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index}>{part}</strong>;
    }
    return part;
  });
};

export const AIInsightsCard = () => {
  const { companyId } = useCompanyId();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (!companyId) {
      toast.error('Keine Unternehmens-ID gefunden');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('esg-ai-analysis', {
        body: { companyId, analysisType: 'dashboard' }
      });

      if (error) throw error;

      if (data.analysis && Array.isArray(data.analysis)) {
        setInsights(data.analysis);
      } else if (data.rawContent) {
        setInsights([{ type: 'positive', text: data.rawContent }]);
      }
      
      setHasAnalyzed(true);
      toast.success('KI-Analyse abgeschlossen');
    } catch (error) {
      console.error('KI-Analyse Fehler:', error);
      toast.error('Fehler bei der KI-Analyse');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasAnalyzed) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            KI-Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Leaf className="h-10 w-10 text-purple-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Lassen Sie Ihre ESG-Daten von der KI analysieren
            </p>
            <Button 
              onClick={handleAnalyze} 
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              KI-Analyse starten
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            KI-Insights
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleAnalyze}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aktualisieren'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            Keine Insights verfügbar. Erfassen Sie mehr Daten.
          </p>
        ) : (
          insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-2">
              {insight.type === 'positive' ? (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              )}
              <p className="text-sm text-foreground">{renderText(insight.text)}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
