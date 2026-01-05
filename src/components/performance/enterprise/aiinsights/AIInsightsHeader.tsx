import React from 'react';
import { Sparkles } from 'lucide-react';

export const AIInsightsHeader = () => {
  return (
    <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
            Über KI-Insights
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Die KI analysiert <strong>Performance-Daten</strong>, erkennt <strong>Muster</strong> und 
            gibt <strong>Empfehlungen</strong> zur Verbesserung. Alle Insights basieren auf 
            aggregierten Daten und respektieren die Privatsphäre der Mitarbeiter.
          </p>
        </div>
      </div>
    </div>
  );
};
