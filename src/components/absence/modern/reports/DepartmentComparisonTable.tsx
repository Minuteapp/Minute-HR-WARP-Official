import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { absenceReportsService } from '@/services/absenceReportsService';

interface DepartmentComparisonTableProps {
  year: string;
}

export const DepartmentComparisonTable = ({ year }: DepartmentComparisonTableProps) => {
  const { data: comparison = [], isLoading } = useQuery({
    queryKey: ['department-comparison', year],
    queryFn: () => absenceReportsService.getDepartmentComparison(parseInt(year))
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-green-100 text-green-700 border-green-200">✓ Gut</Badge>;
      case 'elevated':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">⚠ Erhöht</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">○ Normal</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center p-4 text-muted-foreground">Lädt...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Abteilung</TableHead>
          <TableHead className="text-right">Abwesenheitsrate</TableHead>
          <TableHead className="text-right">Ø Urlaubstage</TableHead>
          <TableHead className="text-right">Ø Krankheitstage</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comparison.map((dept, index) => (
          <TableRow key={index} className={dept.status === 'elevated' ? 'bg-muted/50' : ''}>
            <TableCell className="font-medium">{dept.department}</TableCell>
            <TableCell className={`text-right ${dept.status === 'elevated' ? 'text-orange-600 font-semibold' : ''}`}>
              {dept.absenceRate}%
            </TableCell>
            <TableCell className="text-right">{dept.avgVacationDays} Tage</TableCell>
            <TableCell className="text-right">{dept.avgSickDays} Tage</TableCell>
            <TableCell className="text-right">{getStatusBadge(dept.status)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
