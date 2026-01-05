import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Transaction {
  id: string;
  entry_date: string;
  type: string;
  category: string;
  amount: number;
  approved_by: string | null;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy', { locale: de });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getTypeBadgeVariant = (type: string) => {
    const variants: { [key: string]: string } = {
      Gehalt: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      Software: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      Marketing: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
      Reise: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      Equipment: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    };
    return variants[type] || 'bg-muted text-muted-foreground';
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Letzte Transaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            Keine Transaktionen vorhanden
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Letzte Transaktionen</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead>Genehmigt von</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.entry_date)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getTypeBadgeVariant(transaction.type)}>
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>{transaction.approved_by || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
