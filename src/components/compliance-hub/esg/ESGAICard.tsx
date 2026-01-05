import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface ESGAICardProps {
  analysisText?: string;
  recommendations?: string[];
}

export const ESGAICard: React.FC<ESGAICardProps> = ({ 
  analysisText,
  recommendations 
}) => {
  return (
    <Card className="bg-card border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          KI-ESG-Analyse
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analysisText ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{analysisText}</p>
            {recommendations && recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Strategische Empfehlungen:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Keine KI-Analyse verfügbar. ESG-Daten werden analysiert, sobald ausreichend Daten vorliegen.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
