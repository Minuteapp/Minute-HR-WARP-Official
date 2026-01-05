import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

interface WhatIfSimulatorAdvancedProps {
  selectedEntity: string;
  selectedCurrency: string;
}

export const WhatIfSimulatorAdvanced: React.FC<WhatIfSimulatorAdvancedProps> = ({
  selectedEntity,
  selectedCurrency
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Advanced What-If Simulator - {selectedEntity.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center py-10 text-muted-foreground">
          Erweiterte What-if-Simulationen für komplexe Szenario-Analysen und Impact-Berechnungen.
        </p>
      </CardContent>
    </Card>
  );
};