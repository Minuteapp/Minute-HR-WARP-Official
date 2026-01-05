import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface RollingForecastPanelProps {
  selectedEntity: string;
  selectedCurrency: string;
  timeframe: string;
}

export const RollingForecastPanel: React.FC<RollingForecastPanelProps> = ({
  selectedEntity,
  selectedCurrency,
  timeframe
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Rolling Forecasts - {selectedEntity.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center py-10 text-muted-foreground">
          Rolling Forecasts mit automatischen Aktualisierungen auf Basis von Echtzeitdaten ({timeframe}).
        </p>
      </CardContent>
    </Card>
  );
};