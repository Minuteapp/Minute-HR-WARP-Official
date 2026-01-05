import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export const ForecastScenariosTab = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Forecast & Szenarien</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Hier können Sie Prognosen erstellen und verschiedene Szenarien für Ihre Budgetplanung simulieren.
        </p>
      </CardContent>
    </Card>
  );
};
