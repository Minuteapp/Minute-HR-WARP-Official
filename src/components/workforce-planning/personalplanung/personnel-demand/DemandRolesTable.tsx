import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter } from "lucide-react";

interface DemandRole {
  id: string;
  roleName: string;
  skills: string[];
  team: string;
  location: string;
  currentFTE: number;
  targetFTE: number;
  gap: number;
  timeframe: string;
  source: string;
  yearlyCost: number;
}

interface DemandRolesTableProps {
  roles?: DemandRole[];
}

export const DemandRolesTable = ({ roles = [] }: DemandRolesTableProps) => {
  const hasData = roles.length > 0;

  const totalCurrent = roles.reduce((sum, r) => sum + r.currentFTE, 0);
  const totalTarget = roles.reduce((sum, r) => sum + r.targetFTE, 0);
  const totalGap = roles.reduce((sum, r) => sum + r.gap, 0);
  const totalCost = roles.reduce((sum, r) => sum + r.yearlyCost, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Detaillierte Bedarfe nach Rolle</CardTitle>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Standort</TableHead>
                  <TableHead className="text-right">Ist</TableHead>
                  <TableHead className="text-right">Soll</TableHead>
                  <TableHead className="text-right">Gap</TableHead>
                  <TableHead>Zeitraum</TableHead>
                  <TableHead>Quelle</TableHead>
                  <TableHead className="text-right">Kosten/Jahr</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{role.roleName}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {role.skills.map((skill, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary"
                              className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{role.team}</TableCell>
                    <TableCell>{role.location}</TableCell>
                    <TableCell className="text-right">{role.currentFTE}</TableCell>
                    <TableCell className="text-right">{role.targetFTE}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-semibold">
                        {role.gap}
                      </span>
                    </TableCell>
                    <TableCell>{role.timeframe}</TableCell>
                    <TableCell>{role.source}</TableCell>
                    <TableCell className="text-right">{formatCurrency(role.yearlyCost)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-muted/50">
                  <TableCell colSpan={3}>Gesamt</TableCell>
                  <TableCell className="text-right">{totalCurrent}</TableCell>
                  <TableCell className="text-right">{totalTarget}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-semibold">
                      {totalGap}
                    </span>
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                  <TableCell className="text-right">{formatCurrency(totalCost)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Keine Bedarfe erfasst. Klicken Sie auf "Neuer Bedarf" um einen Bedarf anzulegen.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
