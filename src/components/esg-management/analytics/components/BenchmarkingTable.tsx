import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3 } from 'lucide-react';

export const BenchmarkingTable = () => {
  // Benchmarking erfordert externe Branchendaten - zeige Platzhalter
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Branchen-Benchmarking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <BarChart3 className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground mb-2">Keine Benchmark-Daten verfügbar</p>
          <p className="text-xs text-muted-foreground max-w-md">
            Für den Branchenvergleich werden externe Benchmark-Daten benötigt. 
            Kontaktieren Sie uns, um Branchendaten zu integrieren.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
