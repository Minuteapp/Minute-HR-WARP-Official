import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Transaction {
  id: string;
  entry_date: string;
  description: string;
  employee_name: string | null;
  cost_center: string | null;
  reference_number: string | null;
  amount: number;
  approved_by: string | null;
}

interface SubcategoryLineItemsProps {
  items: Transaction[];
}

export const SubcategoryLineItems: React.FC<SubcategoryLineItemsProps> = ({ items }) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd.M.yyyy', { locale: de });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="border rounded-t-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs">Datum</TableHead>
            <TableHead className="text-xs">Beschreibung</TableHead>
            <TableHead className="text-xs">Mitarbeiter</TableHead>
            <TableHead className="text-xs">Kostenstelle</TableHead>
            <TableHead className="text-xs">Referenz</TableHead>
            <TableHead className="text-xs text-right">Betrag (€)</TableHead>
            <TableHead className="text-xs">Genehmigt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="text-sm">
              <TableCell className="py-2">{formatDate(item.entry_date)}</TableCell>
              <TableCell className="py-2">{item.description}</TableCell>
              <TableCell className="py-2">{item.employee_name || '-'}</TableCell>
              <TableCell className="py-2">{item.cost_center || '-'}</TableCell>
              <TableCell className="py-2">
                {item.reference_number ? (
                  <Badge variant="outline" className="font-mono text-xs">
                    {item.reference_number}
                  </Badge>
                ) : '-'}
              </TableCell>
              <TableCell className="py-2 text-right font-medium">
                {formatCurrency(item.amount)}
              </TableCell>
              <TableCell className="py-2">{item.approved_by || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
