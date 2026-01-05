
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Employee } from "@/types/employee.types";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";
import { EmployeeActions } from "./EmployeeActions";
import { format, parseISO } from "date-fns";

interface EmployeeTableRowProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDeactivate: (employeeId: string) => void;
}

export const EmployeeTableRow = ({
  employee,
  onEdit,
  onDeactivate,
}: EmployeeTableRowProps) => {
  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">{employee.name}</TableCell>
      <TableCell>{employee.position || "-"}</TableCell>
      <TableCell>{employee.department || employee.team || "-"}</TableCell>
      <TableCell>
        <EmployeeStatusBadge status={employee.status || "active"} />
      </TableCell>
      <TableCell>
        {employee.start_date
          ? format(parseISO(employee.start_date), "dd.MM.yyyy")
          : "-"}
      </TableCell>
      <TableCell>{employee.company_name || "-"}</TableCell>
      <TableCell className="text-right">
        <EmployeeActions
          employee={employee}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
        />
      </TableCell>
    </TableRow>
  );
};
