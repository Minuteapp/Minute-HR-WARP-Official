import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";

interface GoalsFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  employeeFilter: string;
  onEmployeeChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sourceFilter: string;
  onSourceChange: (value: string) => void;
  employees: { id: string; first_name: string; last_name: string }[];
  departments: { id: string; name: string }[];
  totalCount: number;
  filteredCount: number;
}

export const GoalsFilterBar = ({
  searchQuery,
  onSearchChange,
  employeeFilter,
  onEmployeeChange,
  departmentFilter,
  onDepartmentChange,
  statusFilter,
  onStatusChange,
  sourceFilter,
  onSourceChange,
  employees,
  departments,
  totalCount,
  filteredCount
}: GoalsFilterBarProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nach Ziel oder Mitarbeiter suchen..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ziel hinzufügen
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
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

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="in_progress">Im Plan</SelectItem>
            <SelectItem value="at_risk">Gefährdet</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={onSourceChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Alle Quellen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Quellen</SelectItem>
            <SelectItem value="individual">Individuell</SelectItem>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="company">Unternehmen</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground ml-auto">
          {filteredCount} von {totalCount} Zielen
        </span>
      </div>
    </div>
  );
};
