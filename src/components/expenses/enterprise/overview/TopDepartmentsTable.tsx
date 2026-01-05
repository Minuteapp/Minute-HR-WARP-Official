
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DepartmentData {
  rank: number;
  name: string;
  employees: number;
  totalExpenses: number;
  avgPerEmployee: number;
  percentOfTotal: number;
}

interface TopDepartmentsTableProps {
  departments?: DepartmentData[];
  totalCostCenters?: number;
  onShowAll?: () => void;
}

const TopDepartmentsTable = ({ departments = [], totalCostCenters = 0, onShowAll }: TopDepartmentsTableProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)} Mio`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Top 5 Abteilungen nach Ausgaben</CardTitle>
            <p className="text-sm text-muted-foreground">Aggregiert aus {totalCostCenters} Kostenstellen</p>
          </div>
          <button 
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            onClick={onShowAll}
          >
            Alle {totalCostCenters} Kostenstellen anzeigen →
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {departments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rang</TableHead>
                <TableHead>Abteilung</TableHead>
                <TableHead className="text-right">Mitarbeiter</TableHead>
                <TableHead className="text-right">Ausgaben</TableHead>
                <TableHead className="text-right">Ø pro MA</TableHead>
                <TableHead className="text-right">% vom Gesamt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.rank}>
                  <TableCell>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-medium">
                      {dept.rank}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-right">{dept.employees.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(dept.totalExpenses)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dept.avgPerEmployee)}</TableCell>
                  <TableCell className="text-right">{dept.percentOfTotal.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Keine Abteilungsdaten verfügbar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopDepartmentsTable;
