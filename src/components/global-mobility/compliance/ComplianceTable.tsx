
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ComplianceCategoryBadge } from './ComplianceCategoryBadge';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ComplianceEntry {
  id: string;
  request_id: string | null;
  compliance_type: string;
  requirement: string;
  status: string;
  due_date: string | null;
  completed_date: string | null;
  responsible_party: string | null;
  notes: string | null;
}

interface ComplianceTableProps {
  data: ComplianceEntry[];
}

export function ComplianceTable({ data }: ComplianceTableProps) {
  if (data.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Keine Compliance-Einträge vorhanden</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kategorie</TableHead>
            <TableHead>Anforderung</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fälligkeitsdatum</TableHead>
            <TableHead>Abgeschlossen am</TableHead>
            <TableHead>Verantwortlich</TableHead>
            <TableHead>Notizen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <ComplianceCategoryBadge category={entry.compliance_type} />
              </TableCell>
              <TableCell className="font-medium">{entry.requirement}</TableCell>
              <TableCell>
                <ComplianceStatusBadge status={entry.status} />
              </TableCell>
              <TableCell>
                {entry.due_date ? format(new Date(entry.due_date), 'dd.MM.yyyy', { locale: de }) : '-'}
              </TableCell>
              <TableCell>
                {entry.completed_date ? format(new Date(entry.completed_date), 'dd.MM.yyyy', { locale: de }) : '-'}
              </TableCell>
              <TableCell>{entry.responsible_party || '-'}</TableCell>
              <TableCell className="max-w-[200px] truncate">{entry.notes || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
