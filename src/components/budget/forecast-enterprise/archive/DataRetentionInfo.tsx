import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

export const DataRetentionInfo: React.FC = () => {
  return (
    <Card className="bg-cyan-50 border-cyan-200">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <h4 className="font-semibold text-cyan-900 mb-1">
              Datenaufbewahrungsrichtlinie
            </h4>
            <p className="text-sm text-cyan-700">
              Gemäß den gesetzlichen Anforderungen werden alle Budget- und Finanzdaten 
              für mindestens 10 Jahre aufbewahrt. Archivierte Daten sind jederzeit 
              abrufbar und können für Audits und Compliance-Prüfungen exportiert werden. 
              Die Datenintegrität wird durch regelmäßige Backups und Prüfsummen sichergestellt.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
