import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calculator, Inbox } from 'lucide-react';

const TimeTrackingIntegration: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Zeiterfassung & Rechnungsintegration
          </CardTitle>
          <div className="flex gap-2">
            <Button disabled className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Integration starten
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground font-medium">Integration nicht konfiguriert</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Die automatische Verknüpfung von Zeiterfassung und Rechnungen erfordert eine aktive Zeiterfassungs-Integration.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Bitte konfigurieren Sie die Zeiterfassung in den Einstellungen.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackingIntegration;
