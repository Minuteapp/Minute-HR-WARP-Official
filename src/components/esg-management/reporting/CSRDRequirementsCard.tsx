import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

export const CSRDRequirementsCard = () => {
  const requirements = [
    {
      label: 'Berichtspflichtig ab',
      value: '2025 (Geschäftsjahr 2024)',
    },
    {
      label: 'Anwendbare Standards',
      value: 'ESRS 1, ESRS 2, ESRS E1-E5, ESRS S1-S4, ESRS G1',
    },
    {
      label: 'Prüfungspflicht',
      value: 'Limited Assurance',
    },
    {
      label: 'Veröffentlichung',
      value: 'Im Lagebericht (ESEF-Format)',
    },
  ];

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              CSRD-Berichtspflicht & Anforderungen
            </h3>
            <div className="space-y-2">
              {requirements.map((req, index) => (
                <div key={index} className="flex">
                  <span className="text-sm font-medium text-muted-foreground w-44 flex-shrink-0">
                    {req.label}:
                  </span>
                  <span className="text-sm text-foreground">{req.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
