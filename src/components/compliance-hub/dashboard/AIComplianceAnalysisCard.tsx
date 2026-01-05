// Compliance Hub - KI-gestützte Compliance-Analyse Card
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Lightbulb } from 'lucide-react';

export interface AIAnalysisData {
  analysisText: string;
  recommendations: string[];
}

interface AIComplianceAnalysisCardProps {
  data?: AIAnalysisData;
  isLoading?: boolean;
}

export const AIComplianceAnalysisCard: React.FC<AIComplianceAnalysisCardProps> = ({
  data,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            KI-gestützte Compliance-Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            KI-gestützte Compliance-Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Keine Analyse-Daten verfügbar. Die KI-Analyse wird generiert, sobald Compliance-Daten vorliegen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          KI-gestützte Compliance-Analyse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{data.analysisText}</p>
        
        {data.recommendations.length > 0 && (
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm text-purple-700 dark:text-purple-300">KI-Empfehlungen:</span>
            </div>
            <ul className="space-y-1">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-purple-600 dark:text-purple-400 flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
