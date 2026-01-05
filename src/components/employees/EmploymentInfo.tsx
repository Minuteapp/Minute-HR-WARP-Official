
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Building, Calendar, Clock, FileText, Users } from 'lucide-react';
import { useCompanyDepartments, useCompanyTeams } from "@/hooks/useCompanyDepartments";

interface EmploymentInformation {
  position: string;
  department: string;
  team?: string;
  startDate: string;
  workingHours: string;
  taxId: string;
  socialSecurityNumber: string;
}

interface EmploymentInfoProps {
  employee: EmploymentInformation;
  isEditing?: boolean;
  onFieldChange?: (field: string, value: string) => void;
}

export const EmploymentInfo = ({ 
  employee,
  isEditing = false,
  onFieldChange = () => {}
}: EmploymentInfoProps) => {
  const { data: departments = [] } = useCompanyDepartments();
  const { data: teams = [] } = useCompanyTeams(employee.department);

  const renderField = (value: string, onChange: (value: string) => void) => {
    if (isEditing) {
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-[300px]"
        />
      );
    }
    return <dd>{value || '-'}</dd>;
  };

  const renderDepartmentField = (value: string, onChange: (value: string) => void) => {
    if (isEditing) {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="max-w-[300px]">
            <SelectValue placeholder="Abteilung auswählen" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return <dd>{value || '-'}</dd>;
  };

  const renderTeamField = (value: string, onChange: (value: string) => void) => {
    if (isEditing) {
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className="max-w-[300px]">
            <SelectValue placeholder="Team auswählen" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.name}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return <dd>{value || '-'}</dd>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beschäftigungsinformationen</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Position:
            </dt>
            {renderField(employee.position, (value) => onFieldChange('position', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <Building className="w-4 h-4" />
              Abteilung:
            </dt>
            {renderDepartmentField(employee.department, (value) => onFieldChange('department', value))}
          </div>
          {(isEditing || employee.team) && (
            <div className="flex justify-between items-center">
              <dt className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team:
              </dt>
              {renderTeamField(employee.team || '', (value) => onFieldChange('team', value))}
            </div>
          )}
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Startdatum:
            </dt>
            {renderField(employee.startDate, (value) => onFieldChange('startDate', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Wochenstunden:
            </dt>
            {renderField(employee.workingHours, (value) => onFieldChange('workingHours', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Steuer-ID:
            </dt>
            {renderField(employee.taxId, (value) => onFieldChange('taxId', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Sozialversicherungsnummer:
            </dt>
            {renderField(employee.socialSecurityNumber, (value) => onFieldChange('socialSecurityNumber', value))}
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};
