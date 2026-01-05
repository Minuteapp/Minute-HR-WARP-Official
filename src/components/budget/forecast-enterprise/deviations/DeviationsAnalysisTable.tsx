import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { TrendIndicator } from './TrendIndicator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DeviationsAnalysisTableProps {
  deviationType: string;
  onDrillDown?: (category: string) => void;
}

export const DeviationsAnalysisTable: React.FC<DeviationsAnalysisTableProps> = ({
  deviationType,
  onDrillDown
}) => {
  const { data: deviations } = useQuery({
    queryKey: ['deviations-table', deviationType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_deviations')
        .select('*')
        .order('deviation_amount', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `€ ${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `€ ${(value / 1000).toFixed(0)}k`;
    return `€ ${value.toFixed(0)}`;
  };

  const formatDeviation = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${formatCurrency(value)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Detaillierte Abweichungsanalyse</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategorie</TableHead>
              <TableHead className="text-right">Plan</TableHead>
              <TableHead className="text-right">Ist (YTD)</TableHead>
              <TableHead className="text-right">Forecast</TableHead>
              <TableHead className="text-right">Abweichung</TableHead>
              <TableHead className="text-right">%</TableHead>
              <TableHead>Trend</TableHead>
              <TableHead>Aktion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deviations && deviations.length > 0 ? (
              deviations.map((deviation) => {
                const isCritical = Math.abs(deviation.deviation_percent || 0) > 10;
                return (
                  <TableRow key={deviation.id} className={isCritical ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isCritical && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        <span className="font-medium">{deviation.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(deviation.plan_amount || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(deviation.actual_ytd_amount || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(deviation.forecast_amount || 0)}</TableCell>
                    <TableCell className={`text-right font-medium ${
                      (deviation.deviation_amount || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {formatDeviation(deviation.deviation_amount || 0)}
                    </TableCell>
                    <TableCell className={`text-right ${
                      (deviation.deviation_percent || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {(deviation.deviation_percent || 0) > 0 ? '+' : ''}{(deviation.deviation_percent || 0).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <TrendIndicator trend={(deviation.trend as 'rising' | 'falling' | 'stable') || 'stable'} />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-primary p-0 h-auto"
                        onClick={() => onDrillDown?.(deviation.category)}
                      >
                        Drill-down
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Keine Abweichungsdaten verfügbar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
