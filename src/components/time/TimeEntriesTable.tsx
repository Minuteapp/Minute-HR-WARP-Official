
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { TimeEntry } from "@/types/time-tracking.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TimeEntriesTableProps {
  timeEntries: TimeEntry[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const calculateDuration = (start: string, end: string | null) => {
  if (!end) return '-';
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diffInMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

const calculateTotalBreakTime = (entries: TimeEntry[]) => {
  let totalBreakMinutes = 0;
  entries.forEach(entry => {
    totalBreakMinutes += entry.break_minutes || 0;
  });
  const hours = Math.floor(totalBreakMinutes / 60);
  const minutes = totalBreakMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

const calculateTotalWorkTime = (entries: TimeEntry[]) => {
  let totalMinutes = 0;
  entries.forEach(entry => {
    if (entry.start_time && entry.end_time) {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
      totalMinutes += diffInMinutes - (entry.break_minutes || 0);
    }
  });
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

export const TimeEntriesTable = ({ 
  timeEntries, 
  searchQuery, 
  onSearchChange 
}: TimeEntriesTableProps) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Heutige Arbeitszeit</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">Gesamte Arbeitszeit: </span>
            <span>{calculateTotalWorkTime(timeEntries)}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Gesamte Pausenzeit: </span>
            <span>{calculateTotalBreakTime(timeEntries)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Input
            type="text"
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Startzeit</TableHead>
              <TableHead>Endzeit</TableHead>
              <TableHead>Dauer</TableHead>
              <TableHead>Pause</TableHead>
              <TableHead>Projekt</TableHead>
              <TableHead>Standort</TableHead>
              <TableHead>Notiz</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{format(new Date(entry.start_time), 'HH:mm')}</TableCell>
                <TableCell>
                  {entry.end_time ? format(new Date(entry.end_time), 'HH:mm') : '-'}
                </TableCell>
                <TableCell>{calculateDuration(entry.start_time, entry.end_time)}</TableCell>
                <TableCell>{entry.break_minutes ? `${Math.floor(entry.break_minutes / 60)}:${(entry.break_minutes % 60).toString().padStart(2, '0')}` : '-'}</TableCell>
                <TableCell>{entry.project || '-'}</TableCell>
                <TableCell>
                  {entry.location === 'office' 
                    ? 'Im Büro' 
                    : entry.location === 'home' 
                    ? 'Home Office' 
                    : 'Unterwegs'}
                </TableCell>
                <TableCell>{entry.note || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
