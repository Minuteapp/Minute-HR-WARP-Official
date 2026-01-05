
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, ChevronDown, ChevronRight, Layers, TrendingUp, TrendingDown } from 'lucide-react';

interface DivisionData {
  id: string;
  name: string;
  departmentCount: number;
  employees: number;
  locations: number;
  expenses: number;
  budget: number;
  deviation: number;
  avgPerEmployee: number;
}

interface DivisionsTableProps {
  divisions: DivisionData[];
  onViewDivision: (division: DivisionData) => void;
}

const DivisionsTable = ({ divisions, onViewDivision }: DivisionsTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (num: number) => {
    if (num >= 1000000) {
      return `€${(num / 1000000).toFixed(2)} Mio`;
    }
    return `€${num.toLocaleString('de-DE')}`;
  };

  const totalDepartments = divisions.reduce((sum, d) => sum + d.departmentCount, 0);

  if (divisions.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Divisionen-Übersicht</CardTitle>
          <p className="text-sm text-muted-foreground">Keine Divisionen vorhanden</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Layers className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Keine Daten verfügbar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Divisionen-Übersicht</CardTitle>
            <p className="text-sm text-muted-foreground">Aggregiert aus {totalDepartments} Abteilungen</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12"></TableHead>
              <TableHead>Division</TableHead>
              <TableHead className="text-right">Abteilungen</TableHead>
              <TableHead className="text-right">Mitarbeiter</TableHead>
              <TableHead className="text-right">Standorte</TableHead>
              <TableHead className="text-right">Ausgaben</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Abweichung</TableHead>
              <TableHead className="text-right">Ø pro MA</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {divisions.map((division) => (
              <TableRow key={division.id}>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => toggleRow(division.id)}
                  >
                    {expandedRows.has(division.id) 
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Layers className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{division.name}</p>
                      <p className="text-sm text-muted-foreground">{division.departmentCount} Abteilungen</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{division.departmentCount}</TableCell>
                <TableCell className="text-right">{division.employees.toLocaleString('de-DE')}</TableCell>
                <TableCell className="text-right">{division.locations}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(division.expenses)}</TableCell>
                <TableCell className="text-right">{formatCurrency(division.budget)}</TableCell>
                <TableCell className="text-right">
                  <span className={`flex items-center justify-end gap-1 ${division.deviation >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {division.deviation >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {division.deviation >= 0 ? '+' : ''}{division.deviation}%
                  </span>
                </TableCell>
                <TableCell className="text-right">€{division.avgPerEmployee.toLocaleString('de-DE')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onViewDivision(division)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => toggleRow(division.id)}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DivisionsTable;
