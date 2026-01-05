import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Archive, Eye, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { YearBadge } from './YearBadge';
import { ArchiveStatusBadge } from './ArchiveStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';

interface ArchivedBudgetsTableProps {
  searchTerm: string;
}

export const ArchivedBudgetsTable: React.FC<ArchivedBudgetsTableProps> = ({ searchTerm }) => {
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['archived-budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('archived_budgets')
        .select('*')
        .order('fiscal_year', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const filteredBudgets = budgets?.filter(budget =>
    budget.budget_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.fiscal_year.toString().includes(searchTerm)
  );

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€ ${(value / 1000000).toFixed(2)} Mio`;
    }
    return `€ ${value.toLocaleString('de-DE')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-primary" />
          Archivierte Jahresbudgets
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : filteredBudgets && filteredBudgets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jahr</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead className="text-right">Endstand</TableHead>
                <TableHead className="text-right">Abweichung</TableHead>
                <TableHead>Abgeschlossen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBudgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>
                    <YearBadge year={budget.fiscal_year} />
                  </TableCell>
                  <TableCell className="font-medium">{budget.budget_name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(budget.final_amount) || 0)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    (Number(budget.deviation_percent) || 0) < 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(Number(budget.deviation_percent) || 0) > 0 ? '+' : ''}
                    {Number(budget.deviation_percent)?.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    {budget.closed_date 
                      ? new Date(budget.closed_date).toLocaleDateString('de-DE')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <ArchiveStatusBadge status={budget.status as 'completed' | 'cancelled'} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Keine archivierten Budgets vorhanden.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
