import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmploymentInfo } from "@/types/employee-profile.types";
import { useCompanyDepartments, useCompanyTeams } from "@/hooks/useCompanyDepartments";

interface EmploymentSectionProps {
  employmentInfo: EmploymentInfo;
  isEditing: boolean;
  onFieldChange: (field: string, value: string) => void;
}

export const EmploymentSection = ({
  employmentInfo,
  isEditing,
  onFieldChange
}: EmploymentSectionProps) => {
  const { data: departments = [] } = useCompanyDepartments();
  const { data: teams = [] } = useCompanyTeams();

  const renderField = (
    id: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    type: string = "text",
    placeholder?: string
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!isEditing}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </div>
  );

  const renderDepartmentField = () => (
    <div className="space-y-1.5">
      <Label htmlFor="department" className="text-xs font-medium">Abteilung</Label>
      {isEditing ? (
        <Select value={employmentInfo.department} onValueChange={(value) => onFieldChange('department', value)}>
          <SelectTrigger className="h-8 text-sm">
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
      ) : (
        <Input
          value={employmentInfo.department}
          disabled
          className="h-8 text-sm"
        />
      )}
    </div>
  );

  const renderTeamField = () => (
    <div className="space-y-1.5">
      <Label htmlFor="team" className="text-xs font-medium">Team</Label>
      {isEditing ? (
        <Select value={employmentInfo.team || ''} onValueChange={(value) => onFieldChange('team', value)}>
          <SelectTrigger className="h-8 text-sm">
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
      ) : (
        <Input
          value={employmentInfo.team || ''}
          disabled
          className="h-8 text-sm"
        />
      )}
    </div>
  );

  return (
    <Card className="border-gray-200 shadow-sm hover:shadow transition-shadow">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
          Beschäftigungsinformationen
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          {renderField('position', 'Position', employmentInfo.position, (value) => onFieldChange('position', value))}
          {renderDepartmentField()}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {renderTeamField()}
          {renderField('startDate', 'Eintrittsdatum', employmentInfo.startDate, (value) => onFieldChange('startDate', value), 'date')}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {renderField('workingHours', 'Wochenarbeitszeit', employmentInfo.workingHours, (value) => onFieldChange('workingHours', value), 'number')}
          {renderField('vacationDays', 'Urlaubstage', employmentInfo.vacationDays, (value) => onFieldChange('vacationDays', value), 'number')}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {renderField('workStartTime', 'Arbeitsbeginn', employmentInfo.workStartTime, (value) => onFieldChange('workStartTime', value), 'time')}
          {renderField('workEndTime', 'Arbeitsende', employmentInfo.workEndTime, (value) => onFieldChange('workEndTime', value), 'time')}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {renderField('lunchBreakStart', 'Pausenbeginn', employmentInfo.lunchBreakStart, (value) => onFieldChange('lunchBreakStart', value), 'time')}
          {renderField('lunchBreakEnd', 'Pausenende', employmentInfo.lunchBreakEnd, (value) => onFieldChange('lunchBreakEnd', value), 'time')}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {renderField('taxId', 'Steuer-ID', employmentInfo.taxId, (value) => onFieldChange('taxId', value))}
          {renderField('socialSecurityNumber', 'Sozialversicherungsnummer', employmentInfo.socialSecurityNumber, (value) => onFieldChange('socialSecurityNumber', value))}
        </div>
      </CardContent>
    </Card>
  );
};