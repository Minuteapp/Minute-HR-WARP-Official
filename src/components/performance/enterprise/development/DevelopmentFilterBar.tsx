import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface DevelopmentFilterBarProps {
  employeeFilter: string;
  onEmployeeChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  employees: { id: string; first_name: string; last_name: string }[];
  departments: { id: string; name: string }[];
  onAddAction: () => void;
}

export const DevelopmentFilterBar = ({
  employeeFilter,
  onEmployeeChange,
  departmentFilter,
  onDepartmentChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  employees,
  departments,
  onAddAction
}: DevelopmentFilterBarProps) => {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <div className="flex flex-wrap gap-3">
        <Select value={employeeFilter} onValueChange={onEmployeeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Mitarbeitende" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Mitarbeitende</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={departmentFilter} onValueChange={onDepartmentChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Abteilungen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Alle Typen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="training">Schulung</SelectItem>
            <SelectItem value="coaching">Coaching</SelectItem>
            <SelectItem value="mentoring">Mentoring</SelectItem>
            <SelectItem value="goal_adjustment">Zielanpassung</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="in_progress">In Bearbeitung</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onAddAction} className="gap-2">
        <Plus className="h-4 w-4" />
        Maßnahme hinzufügen
      </Button>
    </div>
  );
};
