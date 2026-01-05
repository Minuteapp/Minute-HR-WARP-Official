
import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeTableLoading } from "./components/EmployeeTableLoading";
import { EmployeeTableEmpty } from "./components/EmployeeTableEmpty";
import { EmployeeTableRow } from "./components/EmployeeTableRow";

interface EmployeeTableProps {
  employees: any[];
  isLoading: boolean;
  onEdit: (employee: any) => void;
  onDeactivate: (employeeId: string) => void;
}

export const EmployeeTable = ({
  employees,
  isLoading,
  onEdit,
  onDeactivate,
}: EmployeeTableProps) => {
  if (isLoading) {
    return <EmployeeTableLoading />;
  }

  if (!employees?.length) {
    return <EmployeeTableEmpty />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Abteilung</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Start Datum</TableHead>
          <TableHead>Firma</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <EmployeeTableRow
            key={employee.id}
            employee={employee}
            onEdit={onEdit}
            onDeactivate={onDeactivate}
          />
        ))}
      </TableBody>
    </Table>
  );
};
