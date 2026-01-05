import React from 'react';
import { Quote } from 'lucide-react';

export const InspirationalQuote = () => {
  return (
    <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Quote className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-purple-800 dark:text-purple-200 italic">
          "Performance Management ist nicht das Messen von Menschen, sondern das Ermöglichen 
          ihres Wachstums. Fokussieren Sie sich auf Entwicklung, nicht auf Bewertung."
        </p>
      </div>
    </div>
  );
};
