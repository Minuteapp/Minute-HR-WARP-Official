import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, AlertTriangle } from 'lucide-react';

interface DataProtectionAICardProps {
  analysisText?: string;
  warningText?: string;
}

export const DataProtectionAICard: React.FC<DataProtectionAICardProps> = ({
  analysisText,
  warningText,
}) => {
  const hasContent = analysisText || warningText;

  return (
    <Card className="bg-card border-purple-200 dark:border-purple-800">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/30 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">KI-Empfehlungen: Datenschutz</h3>
            
            {hasContent ? (
              <>
                {analysisText && (
                  <p className="text-sm text-muted-foreground mt-2">{analysisText}</p>
                )}
                
                {warningText && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-yellow-800 dark:text-yellow-200">Warnung: </span>
                        <span className="text-sm text-yellow-700 dark:text-yellow-300">{warningText}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                Keine KI-Empfehlungen verfügbar. Sobald Datenschutz-Aktivitäten vorliegen, werden hier automatisch Empfehlungen angezeigt.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
