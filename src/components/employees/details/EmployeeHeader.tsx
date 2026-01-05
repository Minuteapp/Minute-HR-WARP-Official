
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Employee } from "@/types/employee.types";
import { Archive, Briefcase, MoreVertical, UserCheck } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const getEmploymentTypeLabel = (type?: string) => {
  switch (type) {
    case 'full_time':
      return 'Vollzeit';
    case 'part_time':
      return 'Teilzeit';
    case 'temporary':
      return 'Befristet';
    case 'freelance':
      return 'Freiberuflich';
    case 'intern':
      return 'Praktikant';
    default:
      return 'Nicht angegeben';
  }
};

interface EmployeeHeaderProps {
  employee: Employee;
  onArchive?: () => void;
  isArchiving?: boolean;
}

export const EmployeeDetailsHeader = ({ employee, onArchive, isArchiving }: EmployeeHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-6 mb-6 border border-[#3B44F6] shadow-[0_4px_10px_rgba(59,68,246,0.1)]">
      <div className="flex justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold text-primary">
            {employee.name?.charAt(0)}
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{employee.name}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {employee.position}
              </Badge>
              {employee.department && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {employee.department}
                </Badge>
              )}
              <Badge 
                variant={employee.status === 'active' ? 'success' : 'secondary'}
                className="flex items-center gap-1"
              >
                <UserCheck className="h-3 w-3" />
                {employee.status === 'active' ? 'Aktiv' : 'Inaktiv'}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {getEmploymentTypeLabel(employee.employment_type)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onArchive?.(); }} disabled={!!isArchiving}>
                <Archive className="h-4 w-4 mr-2" />
                {isArchiving ? 'Archivieren…' : 'Archivieren'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};
