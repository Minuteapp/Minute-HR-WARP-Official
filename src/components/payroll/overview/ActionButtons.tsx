import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, AlertCircle, FileDown, FileText } from "lucide-react";

interface ActionButtonsProps {
  openIssuesCount: number;
  departments: string[];
  selectedDepartment: string;
  onDepartmentChange: (department: string) => void;
  onNewPayroll: () => void;
  onOpenIssues: () => void;
  onDatevExport: () => void;
  onMonthlyReport: () => void;
}

export const ActionButtons = ({
  openIssuesCount,
  departments,
  selectedDepartment,
  onDepartmentChange,
  onNewPayroll,
  onOpenIssues,
  onDatevExport,
  onMonthlyReport,
}: ActionButtonsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={onNewPayroll} className="gap-2">
        <Plus className="h-4 w-4" />
        Neue Abrechnung
      </Button>

      <Button variant="outline" onClick={onOpenIssues} className="gap-2">
        <AlertCircle className="h-4 w-4" />
        Offene Punkte
        {openIssuesCount > 0 && (
          <Badge 
            variant="destructive" 
            className="ml-1 h-5 min-w-5 px-1.5 text-xs font-semibold"
          >
            {openIssuesCount}
          </Badge>
        )}
      </Button>

      <Button variant="outline" onClick={onDatevExport} className="gap-2">
        <FileDown className="h-4 w-4" />
        DATEV Export
      </Button>

      <Button variant="outline" onClick={onMonthlyReport} className="gap-2">
        <FileText className="h-4 w-4" />
        Monatsreport
      </Button>

      <div className="ml-auto">
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Abteilungen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
