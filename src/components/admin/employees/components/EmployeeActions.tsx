
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, UserX } from "lucide-react";
import { Employee } from "@/types/employee.types";

interface EmployeeActionsProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDeactivate: (employeeId: string) => void;
}

export const EmployeeActions = ({ 
  employee, 
  onEdit, 
  onDeactivate 
}: EmployeeActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(employee)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDeactivate(employee.id)}
      >
        <UserX className="h-4 w-4" />
      </Button>
    </div>
  );
};
