import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { LevelBadge } from './LevelBadge';
import { StatusBadge } from './StatusBadge';

interface Budget {
  id: string;
  name: string;
  level: string;
  budget_type: string;
  period: string;
  total_amount: number;
  responsible_person: string;
  status: string;
}

interface BudgetsTableProps {
  budgets: Budget[];
  onViewDetails: (id: string) => void;
}

export const BudgetsTable: React.FC<BudgetsTableProps> = ({ budgets, onViewDetails }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const getBudgetTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      annual: 'Jahresbudget',
      quarterly: 'Quartalsbudget',
      project: 'Projektbudget',
      personnel: 'Personalbudget',
      investment: 'Investitionsbudget',
      esg: 'ESG-Budget',
    };
    return types[type] || type;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Budgets</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Budget</TableHead>
              <TableHead>Ebene</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Zeitraum</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead>Verantwortlich</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.map((budget) => (
              <TableRow key={budget.id}>
                <TableCell className="font-medium">{budget.name}</TableCell>
                <TableCell>
                  <LevelBadge level={budget.level} />
                </TableCell>
                <TableCell>{getBudgetTypeLabel(budget.budget_type)}</TableCell>
                <TableCell>{budget.period || '-'}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(budget.total_amount)}
                </TableCell>
                <TableCell>{budget.responsible_person || '-'}</TableCell>
                <TableCell>
                  <StatusBadge status={budget.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary"
                    onClick={() => onViewDetails(budget.id)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
