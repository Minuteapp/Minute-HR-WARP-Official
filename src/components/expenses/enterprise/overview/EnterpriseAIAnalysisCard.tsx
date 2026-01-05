
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles } from 'lucide-react';

interface AIInsight {
  topInsight?: string;
  anomalies?: string[];
  optimizationPotential?: string;
}

interface EnterpriseAIAnalysisCardProps {
  insights?: AIInsight;
  employeeCount?: number;
  onOpenAnalysis?: () => void;
  onReviewAnomalies?: () => void;
  onPlanMeasures?: () => void;
}

const EnterpriseAIAnalysisCard = ({ 
  insights, 
  employeeCount = 0,
  onOpenAnalysis,
  onReviewAnomalies,
  onPlanMeasures
}: EnterpriseAIAnalysisCardProps) => {
  const hasData = insights && (insights.topInsight || (insights.anomalies && insights.anomalies.length > 0) || insights.optimizationPotential);

  return (
    <Card className="bg-muted/50 border-border">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-purple-100">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-foreground">
                Enterprise KI-Analyse {employeeCount > 0 ? `(über ${employeeCount.toLocaleString()} MA)` : ''}
              </h3>
            </div>
            
            {hasData ? (
              <div className="space-y-3 text-sm text-muted-foreground">
                {insights.topInsight && (
                  <p>
                    <strong className="text-foreground">Top-Erkenntnis:</strong> {insights.topInsight}
                  </p>
                )}
                
                {insights.anomalies && insights.anomalies.length > 0 && (
                  <p>
                    <strong className="text-foreground">Anomalien:</strong> {insights.anomalies.join(', ')}
                  </p>
                )}
                
                {insights.optimizationPotential && (
                  <p>
                    <strong className="text-foreground">Optimierungspotenzial:</strong> {insights.optimizationPotential}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Keine KI-Analysen verfügbar. Sobald ausreichend Daten vorhanden sind, werden hier intelligente Erkenntnisse angezeigt.
              </p>
            )}
            
            <div className="flex flex-wrap gap-3 mt-4">
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={onOpenAnalysis}
              >
                Detaillierte Analyse öffnen
              </Button>
              <Button 
                variant="outline"
                onClick={onReviewAnomalies}
              >
                Anomalien überprüfen
              </Button>
              <Button 
                variant="outline"
                onClick={onPlanMeasures}
              >
                Maßnahmen planen
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnterpriseAIAnalysisCard;
