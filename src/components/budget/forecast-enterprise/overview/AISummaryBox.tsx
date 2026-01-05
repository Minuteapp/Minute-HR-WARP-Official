import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AISummaryBox = () => {
  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground">KI-Zusammenfassung</h3>
              <Badge variant="secondary" className="text-xs">Vorschau</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Die KI-Analyse wird basierend auf Ihren Budgetdaten generiert. 
              Fügen Sie Budgets hinzu, um detaillierte Einblicke und Empfehlungen zu erhalten.
            </p>
          </div>
          <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};
