import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

export const CSRDWarningBanner = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-amber-800">CSRD-Berichtspflicht: 98 Tage verbleibend</h4>
          </div>
          <p className="text-sm text-amber-700">
            Datenqualität: 92% vollständig. Fehlende Datenpunkte: Scope 3 Kategorie 4, 11, 15; Wesentlichkeitsanalyse; Stakeholder-Engagement.
          </p>
          <button className="mt-2 text-sm font-medium text-amber-800 hover:text-amber-900 flex items-center gap-1">
            Fehlende Daten anzeigen
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
