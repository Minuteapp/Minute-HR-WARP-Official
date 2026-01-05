import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export interface PolicyViolation {
  id: string;
  date: Date;
  employeeName: string;
  policyName: string;
  amount: number;
  limit: number;
  excess: number;
  excessPercent: number;
  explanation?: string;
  status: 'explained' | 'pending';
}

interface PolicyViolationsTableProps {
  violations: PolicyViolation[];
}

const PolicyViolationsTable = ({ violations }: PolicyViolationsTableProps) => {
  if (violations.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Aktuelle Richtlinienverstöße</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Keine Richtlinienverstöße vorhanden</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Aktuelle Richtlinienverstöße</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Mitarbeiter</TableHead>
              <TableHead>Richtlinie</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead className="text-right">Limit</TableHead>
              <TableHead className="text-right">Überschreitung</TableHead>
              <TableHead>Erklärung</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {violations.map((violation) => (
              <TableRow key={violation.id}>
                <TableCell className="text-sm">
                  {format(violation.date, 'dd.MM.yyyy', { locale: de })}
                </TableCell>
                <TableCell className="text-sm">{violation.employeeName}</TableCell>
                <TableCell className="text-sm">{violation.policyName}</TableCell>
                <TableCell className="text-sm text-right">
                  €{violation.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-sm text-right">
                  €{violation.limit.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-sm text-right text-red-600">
                  +€{violation.excess.toLocaleString('de-DE', { minimumFractionDigits: 2 })} (+{violation.excessPercent.toFixed(1)}%)
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {violation.explanation || '-'}
                </TableCell>
                <TableCell>
                  {violation.status === 'explained' ? (
                    <span className="text-purple-600 text-sm font-medium">Erklärt</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-600 rounded px-2 py-0.5 text-xs font-medium">
                      Ausstehend
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PolicyViolationsTable;
