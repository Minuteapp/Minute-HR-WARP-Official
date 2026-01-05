
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import ArchiveStatusBadge from './ArchiveStatusBadge';

interface ArchiveEntry {
  id: string;
  archiveId: string;
  expenseDate: Date;
  employeeName: string;
  category: string;
  description: string;
  project?: string;
  amount: number;
  archivedAt: Date;
  retainUntil: Date;
  status: 'archived';
}

interface ArchiveTableProps {
  entries: ArchiveEntry[];
  onView: (id: string) => void;
  onDownload: (id: string) => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Reisekosten': 'text-primary',
    'Bewirtung': 'text-primary',
    'Software': 'text-primary',
    'Arbeitsmittel': 'text-primary',
    'Kommunikation': 'text-primary',
  };
  return colors[category] || 'text-primary';
};

const ArchiveTable = ({ entries, onView, onDownload }: ArchiveTableProps) => {
  const hasData = entries.length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Archivierte Ausgaben
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Archiv-ID</TableHead>
                  <TableHead className="text-muted-foreground">Ausgabedatum</TableHead>
                  <TableHead className="text-muted-foreground">Mitarbeiter</TableHead>
                  <TableHead className="text-muted-foreground">Kategorie</TableHead>
                  <TableHead className="text-muted-foreground">Beschreibung</TableHead>
                  <TableHead className="text-muted-foreground">Projekt</TableHead>
                  <TableHead className="text-muted-foreground text-right">Betrag</TableHead>
                  <TableHead className="text-muted-foreground">Archiviert am</TableHead>
                  <TableHead className="text-muted-foreground">Aufbewahren bis</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className="border-border">
                    <TableCell className="font-medium text-foreground">{entry.archiveId}</TableCell>
                    <TableCell className="text-foreground">
                      {format(entry.expenseDate, 'dd.MM.yyyy', { locale: de })}
                    </TableCell>
                    <TableCell className="text-foreground">{entry.employeeName}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${getCategoryColor(entry.category)}`}>
                        {entry.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground max-w-[200px] truncate">
                      {entry.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{entry.project || '-'}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      €{entry.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {format(entry.archivedAt, 'dd.MM.yyyy', { locale: de })}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {format(entry.retainUntil, 'dd.MM.yyyy', { locale: de })}
                    </TableCell>
                    <TableCell>
                      <ArchiveStatusBadge status={entry.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onView(entry.id)}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => onDownload(entry.id)}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                        >
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            Keine archivierten Ausgaben gefunden
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArchiveTable;
