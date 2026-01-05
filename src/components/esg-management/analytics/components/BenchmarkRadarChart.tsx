import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export const BenchmarkRadarChart = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Performance-Vergleich: Ihr Unternehmen vs. Branche</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] flex flex-col items-center justify-center text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium text-foreground mb-2">Benchmarking nicht verfügbar</p>
          <p className="text-xs text-muted-foreground max-w-md">
            Für den Branchenvergleich werden externe Benchmark-Daten benötigt. 
            Diese Funktion wird verfügbar, sobald Branchendaten integriert sind.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
