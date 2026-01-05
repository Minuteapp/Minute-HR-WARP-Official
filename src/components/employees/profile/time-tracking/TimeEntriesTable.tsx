
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TimeEntry } from "@/types/time-tracking.types";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeEntriesTableProps {
  timeEntries: TimeEntry[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
}

export const TimeEntriesTable = ({ 
  timeEntries, 
  searchQuery, 
  onSearchChange,
  isLoading = false
}: TimeEntriesTableProps) => {
  const filteredEntries = timeEntries.filter(entry => {
    return entry.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDuration = (startTime: string, endTime: string, breakMinutes: number = 0) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime() - (breakMinutes * 60 * 1000);
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'default';
      case 'pending': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Zeiteinträge</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Nach Projekt oder Ort filtern..."
              className="pl-8 w-64"
              disabled
            />
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Zeiteinträge</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Nach Projekt oder Ort filtern..."
            className="pl-8 w-64"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {filteredEntries.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Projekt</TableHead>
                <TableHead>Startzeit</TableHead>
                <TableHead>Endzeit</TableHead>
                <TableHead>Dauer</TableHead>
                <TableHead>Pause</TableHead>
                <TableHead>Ort</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {format(new Date(entry.start_time), 'dd.MM.yyyy')}
                  </TableCell>
                  <TableCell>{entry.project}</TableCell>
                  <TableCell>
                    {format(new Date(entry.start_time), 'HH:mm')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(entry.end_time), 'HH:mm')}
                  </TableCell>
                  <TableCell>
                    {formatDuration(entry.start_time, entry.end_time, entry.break_minutes)}
                  </TableCell>
                  <TableCell>
                    {entry.break_minutes > 0 ? `${entry.break_minutes} min` : '-'}
                  </TableCell>
                  <TableCell>{entry.location}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(entry.status)}>
                      {entry.status === 'completed' ? 'Abgeschlossen' : 
                       entry.status === 'active' ? 'Aktiv' : 
                       entry.status === 'pending' ? 'Ausstehend' : 'Abgebrochen'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md bg-gray-50">
          <p className="text-gray-500">
            {searchQuery ? 'Keine Ergebnisse für diese Suche gefunden.' : 'Keine Zeiteinträge vorhanden.'}
          </p>
        </div>
      )}
    </div>
  );
};
