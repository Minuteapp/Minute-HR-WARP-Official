import React from 'react';
import { Info } from 'lucide-react';

interface ESGDisclaimerProps {
  text?: string;
}

export const ESGDisclaimer: React.FC<ESGDisclaimerProps> = ({ 
  text = "ESG-Daten werden aus verschiedenen HR-Modulen aggregiert und dienen nur der internen Analyse. Für offizielle ESG-Berichte verwenden Sie bitte die zertifizierten Reporting-Tools."
}) => {
  return (
    <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
      <Info className="h-5 w-5 text-purple-600 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Wichtig</p>
        <p className="text-sm text-purple-700 dark:text-purple-300">{text}</p>
      </div>
    </div>
  );
};
