import React from 'react';
import { Check, X } from 'lucide-react';

export const AICapabilitiesBox = () => {
  const capabilities = [
    'Erkennt Muster in Performance-Daten',
    'Gibt Empfehlungen basierend auf Best Practices',
    'Fasst Feedback zusammen',
    'Identifiziert Entwicklungspotenziale'
  ];

  const limitations = [
    'Trifft keine automatischen Entscheidungen',
    'Greift nicht auf persönliche Daten zu',
    'Ersetzt nicht das menschliche Urteil',
    'Teilt keine individuellen Daten ohne Zustimmung'
  ];

  return (
    <div className="bg-muted/50 rounded-lg p-4 mt-4 border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-foreground mb-3">Was macht die KI?</h4>
          <ul className="space-y-2">
            {capabilities.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-foreground mb-3">Was macht die KI NICHT?</h4>
          <ul className="space-y-2">
            {limitations.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
