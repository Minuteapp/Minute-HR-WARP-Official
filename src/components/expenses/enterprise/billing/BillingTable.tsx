import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Send, Clock, Loader2, CheckCircle, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export interface BillingEntry {
  id: string;
  employeeName: string;
  employeeInitials: string;
  iban?: string;
  period: string;
  expenseCount: number;
  amount: number;
  paymentType: 'payroll' | 'transfer';
  dueDate: Date;
  status: 'pending' | 'processing' | 'reimbursed';
}

interface BillingTableProps {
  entries: BillingEntry[];
  onView: (id: string) => void;
  onSend: (id: string) => void;
}

const BillingTable = ({ entries, onView, onSend }: BillingTableProps) => {
  const getStatusBadge = (status: BillingEntry['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-yellow-600 text-sm">
            <Clock className="h-3 w-3" />
            Ausstehend
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-blue-600 text-sm">
            <Loader2 className="h-3 w-3" />
            In Bearbeitung
          </span>
        );
      case 'reimbursed':
        return (
          <span className="inline-flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle className="h-3 w-3" />
            Erstattet
          </span>
        );
    }
  };

  const getPaymentTypeBadge = (type: BillingEntry['paymentType']) => {
    if (type === 'payroll') {
      return (
        <span className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded px-2 py-0.5 text-xs">
          Payroll
        </span>
      );
    }
    return (
      <span className="bg-purple-100 text-purple-800 border border-purple-300 rounded px-2 py-0.5 text-xs">
        Überweisung
      </span>
    );
  };

  if (entries.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Keine Einträge</h3>
          <p className="text-sm text-muted-foreground">
            In dieser Kategorie befinden sich keine Abrechnungen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>Mitarbeiter</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead className="text-center">Ausgaben</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead>Zahlungsart</TableHead>
              <TableHead>Fällig am</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                        {entry.employeeInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{entry.employeeName}</p>
                      {entry.iban && (
                        <p className="text-xs text-muted-foreground">{entry.iban}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{entry.period}</TableCell>
                <TableCell className="text-sm text-center">{entry.expenseCount}</TableCell>
                <TableCell className="text-sm text-right font-medium">
                  €{entry.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{getPaymentTypeBadge(entry.paymentType)}</TableCell>
                <TableCell className="text-sm">
                  {format(entry.dueDate, 'dd.MM.yyyy', { locale: de })}
                </TableCell>
                <TableCell>{getStatusBadge(entry.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onView(entry.id)}>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onSend(entry.id)}>
                      <Send className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BillingTable;
