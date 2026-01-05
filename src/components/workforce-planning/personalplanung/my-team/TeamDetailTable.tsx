import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface TeamDetail {
  team: string;
  headcount: number;
  fte: number;
  availableHours: number;
  boundHours: number;
  utilization: number;
  status: 'critical' | 'warning' | 'optimal' | 'underutilized';
}

interface TeamDetailTableProps {
  data?: TeamDetail[];
}

const statusConfig = {
  critical: { label: "Kritisch", className: "bg-red-500 text-white hover:bg-red-500" },
  warning: { label: "Warnung", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  optimal: { label: "Optimal", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  underutilized: { label: "Unterauslastung", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" }
};

export const TeamDetailTable = ({ data = [] }: TeamDetailTableProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Detailansicht Teams</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/20">
            <p>Keine Daten verfügbar</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Headcount</TableHead>
                <TableHead className="text-right">FTE</TableHead>
                <TableHead className="text-right">Verfügbar (h)</TableHead>
                <TableHead className="text-right">Gebunden (h)</TableHead>
                <TableHead className="text-right">Auslastung</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.team}</TableCell>
                  <TableCell className="text-right">{row.headcount}</TableCell>
                  <TableCell className="text-right">{row.fte}</TableCell>
                  <TableCell className="text-right">{row.availableHours.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.boundHours.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.utilization}%</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[row.status].className}>
                      {statusConfig[row.status].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
