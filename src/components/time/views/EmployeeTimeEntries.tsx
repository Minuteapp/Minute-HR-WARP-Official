import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

const EmployeeTimeEntries = () => {
  const entries: Array<{ date: string; start: string; end: string; hours: string; project: string; location: string; status: string }> = [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Letzte Zeiteinträge</h3>
        <div className="border rounded-lg overflow-hidden">
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
              {entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{entry.date}</TableCell>
                  <TableCell>{entry.start}</TableCell>
                  <TableCell>{entry.end}</TableCell>
                  <TableCell className="font-medium">{entry.hours}</TableCell>
                  <TableCell>{entry.project}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{entry.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      ✓ Genehmigt
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTimeEntries;
