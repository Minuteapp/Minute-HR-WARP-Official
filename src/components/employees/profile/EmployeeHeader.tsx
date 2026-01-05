
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';

interface Employee {
  name: string;
  position: string;
  team: string;
  status: 'active' | 'inactive';
  employment_type?: string;
}

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
  onEdit: () => void;
}

export const EmployeeHeader = ({ employee, onEdit }: EmployeeHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold">{employee.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{employee.position}</Badge>
            <Badge variant="outline">{employee.team}</Badge>
            <Badge variant={employee.status === 'active' ? 'success' : 'secondary'}>
              {employee.status === 'active' ? 'Aktiv' : 'Inaktiv'}
            </Badge>
            <Badge variant="outline">
              {getEmploymentTypeLabel(employee.employment_type)}
            </Badge>
          </div>
        </div>
        <Button onClick={onEdit} className="flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Bearbeiten
        </Button>
      </div>
    </div>
  );
};
