
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ContractStatusBadge } from './ContractStatusBadge';

interface EmployeeFamily {
  id: string;
  request_id: string | null;
  contract_status: string | null;
  employment_model: string | null;
  work_time_model: string | null;
  family_members_count: number | null;
  created_at: string | null;
  request?: {
    employee_name: string | null;
    current_location: string | null;
    destination_location: string | null;
  };
}

interface EmployeesTableProps {
  data: EmployeeFamily[];
  onViewDetails: (employee: EmployeeFamily) => void;
}

export function EmployeesTable({ data, onViewDetails }: EmployeesTableProps) {
  if (data.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Keine Mitarbeiterdaten vorhanden</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mitarbeiter</TableHead>
            <TableHead>Aktueller Standort</TableHead>
            <TableHead>Zielstandort</TableHead>
            <TableHead>Vertragsstatus</TableHead>
            <TableHead>Beschäftigungsmodell</TableHead>
            <TableHead>Arbeitszeitmodell</TableHead>
            <TableHead>Familienmitglieder</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                {employee.request?.employee_name || '-'}
              </TableCell>
              <TableCell>{employee.request?.current_location || '-'}</TableCell>
              <TableCell>{employee.request?.destination_location || '-'}</TableCell>
              <TableCell>
                {employee.contract_status ? (
                  <ContractStatusBadge status={employee.contract_status} />
                ) : '-'}
              </TableCell>
              <TableCell>{employee.employment_model || '-'}</TableCell>
              <TableCell>{employee.work_time_model || '-'}</TableCell>
              <TableCell>{employee.family_members_count || 0}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onViewDetails(employee)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
