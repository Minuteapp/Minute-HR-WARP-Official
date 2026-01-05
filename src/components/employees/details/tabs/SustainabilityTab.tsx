import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Info } from 'lucide-react';

interface SustainabilityTabProps {
  employee: any;
}

export const SustainabilityTab: React.FC<SustainabilityTabProps> = ({ employee }) => {
  // Keine Mock-Daten mehr - zeigt leeren Zustand
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Leaf className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Nachhaltigkeitsdaten vorhanden</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Für diesen Mitarbeiter wurden noch keine CO₂-Emissionen oder Nachhaltigkeitsaktionen erfasst.
          </p>
          <Button className="mt-6 gap-2">
            Aktivität erfassen
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Nachhaltigkeitsdaten werden aus dem CO₂-Tracking-Modul geladen.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
