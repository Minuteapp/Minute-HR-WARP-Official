import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface TimeEntry {
  date: string;
  start: string;
  end: string;
  hours: string;
  project: string;
  location: string;
  status: 'approved' | 'pending' | 'rejected';
}

const timeEntries: TimeEntry[] = [];

const TeamMemberTimeTab = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Genehmigt</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Ausstehend</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Abgelehnt</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="font-semibold mb-4">Letzte Zeiteinträge</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>Ende</TableHead>
              <TableHead>Stunden</TableHead>
              <TableHead>Projekt</TableHead>
              <TableHead>Standort</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.map((entry, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{entry.date}</TableCell>
                <TableCell>{entry.start}</TableCell>
                <TableCell>{entry.end}</TableCell>
                <TableCell className="font-medium">{entry.hours}</TableCell>
                <TableCell>{entry.project}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {entry.location}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(entry.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TeamMemberTimeTab;
