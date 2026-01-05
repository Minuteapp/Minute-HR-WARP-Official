import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { History } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import ApprovalStatusBadge from './ApprovalStatusBadge';

export interface ApprovalHistory {
  id: string;
  date: Date;
  expenseId: string;
  employeeName: string;
  category: string;
  amount: number;
  decision: 'approved' | 'rejected';
  approvedBy: string;
  reason?: string;
}

interface ApprovalHistoryTableProps {
  history: ApprovalHistory[];
}

const ApprovalHistoryTable = ({ history }: ApprovalHistoryTableProps) => {
  if (history.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Keine Verlaufsdaten</h3>
          <p className="text-sm text-muted-foreground">
            Der Genehmigungsverlauf ist leer.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Genehmigungsverlauf</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Mitarbeiter</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead>Entscheidung</TableHead>
              <TableHead>Genehmigt von</TableHead>
              <TableHead>Grund</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-sm">
                  {format(item.date, 'dd.MM.yyyy', { locale: de })}
                </TableCell>
                <TableCell className="text-sm font-mono">{item.expenseId}</TableCell>
                <TableCell className="text-sm">{item.employeeName}</TableCell>
                <TableCell className="text-sm">{item.category}</TableCell>
                <TableCell className="text-sm text-right">
                  €{item.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <ApprovalStatusBadge status={item.decision} />
                </TableCell>
                <TableCell className="text-sm">{item.approvedBy}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.reason || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ApprovalHistoryTable;
