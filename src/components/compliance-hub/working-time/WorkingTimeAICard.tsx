// Compliance Hub - KI-Analyse Arbeitszeit Card
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Sparkles } from 'lucide-react';

interface WorkingTimeAICardProps {
  analysisText?: string;
  prognosis?: string[];
}

export const WorkingTimeAICard: React.FC<WorkingTimeAICardProps> = ({
  analysisText,
  prognosis = []
}) => {
  if (!analysisText && prognosis.length === 0) {
    return (
      <Card className="bg-card border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">KI-Analyse: Arbeitszeitmanagement</h3>
              <p className="text-sm text-muted-foreground">
                Keine Analyse verfügbar. Fügen Sie Arbeitszeitdaten hinzu, um eine KI-gestützte Analyse zu erhalten.
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
              <h3 className="font-semibold text-foreground mb-2">KI-Analyse: Arbeitszeitmanagement</h3>
              {analysisText && (
                <p className="text-sm text-muted-foreground">{analysisText}</p>
              )}
            </div>
            
            {prognosis.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Prognose & Empfehlungen:</span>
                </div>
                <ul className="space-y-1">
                  {prognosis.map((item, index) => (
                    <li key={index} className="text-sm text-purple-700 dark:text-purple-300 flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      {item}
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
