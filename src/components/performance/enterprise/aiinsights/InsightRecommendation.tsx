import React from 'react';
import { Lightbulb } from 'lucide-react';

interface InsightRecommendationProps {
  recommendation: string;
}

export const InsightRecommendation: React.FC<InsightRecommendationProps> = ({ recommendation }) => {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
      <div className="flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <span className="font-medium">Empfehlung:</span> {recommendation}
        </p>
      </div>
    </div>
  );
};
