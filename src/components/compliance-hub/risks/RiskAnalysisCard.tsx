// Compliance Hub - KI-Risikoanalyse Card
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Lightbulb } from 'lucide-react';

interface RiskAnalysisCardProps {
  analysisText?: string;
  recommendations?: string[];
}

export const RiskAnalysisCard: React.FC<RiskAnalysisCardProps> = ({
  analysisText,
  recommendations = []
}) => {
  if (!analysisText && recommendations.length === 0) {
    return (
      <Card className="bg-card border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">KI-Risikoanalyse</h3>
              <p className="text-sm text-muted-foreground">
                Keine Risikoanalyse verfügbar. Fügen Sie Risiken hinzu, um eine KI-gestützte Analyse zu erhalten.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-purple-200 dark:border-purple-800">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">KI-Risikoanalyse</h3>
              {analysisText && (
                <p className="text-sm text-muted-foreground">{analysisText}</p>
              )}
            </div>
            
            {recommendations.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Empfehlungen:</span>
                </div>
                <ul className="space-y-1">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-purple-700 dark:text-purple-300 flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
