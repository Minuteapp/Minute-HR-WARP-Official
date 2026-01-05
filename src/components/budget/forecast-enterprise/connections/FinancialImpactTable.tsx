import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AutomationBadge } from './AutomationBadge';
import { Skeleton } from '@/components/ui/skeleton';

export const FinancialImpactTable: React.FC = () => {
  const { data: connections, isLoading } = useQuery({
    queryKey: ['budget-module-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_module_connections')
        .select('*')
        .order('impact_yearly', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€ ${(value / 1000000).toFixed(2)} Mio`;
    }
    if (value >= 1000) {
      return `€ ${(value / 1000).toFixed(0)}k`;
    }
    return `€ ${value.toLocaleString('de-DE')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Finanzielle Auswirkungen der Verknüpfungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48" />
        ) : connections && connections.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modul</TableHead>
                <TableHead>Auswirkung auf</TableHead>
                <TableHead className="text-right">Monatlich</TableHead>
                <TableHead className="text-right">Jährlich</TableHead>
                <TableHead>Automatisierung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell className="font-medium">{connection.module_name}</TableCell>
                  <TableCell>{connection.impact_category || '-'}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(connection.impact_monthly) || 0)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(connection.impact_yearly) || 0)}
                  </TableCell>
                  <TableCell>
                    <AutomationBadge 
                      type={connection.automation_type as 'automatic' | 'manual' | 'after_approval'} 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Keine finanziellen Auswirkungen vorhanden.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
