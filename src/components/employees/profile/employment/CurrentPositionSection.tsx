import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CurrentPositionSectionProps {
  employee: Employee | null;
  isEditing?: boolean;
  onFieldChange?: (tab: string, field: string, value: string) => void;
}

export const CurrentPositionSection = ({ employee, isEditing = false, onFieldChange }: CurrentPositionSectionProps) => {
  const renderField = (label: string, value: string | undefined | null, field?: string) => {
    if (isEditing && field && onFieldChange) {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <Input
            value={value || ''}
            onChange={(e) => onFieldChange('employment', field, e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      );
    }
    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value || '-'}</p>
      </div>
    );
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Aktuelle Position
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Rolle & Position</p>
          {isEditing && onFieldChange ? (
            <Input
              value={employee?.position || ''}
              onChange={(e) => onFieldChange('employment', 'position', e.target.value)}
              className="h-9 text-lg font-bold"
            />
          ) : (
            <h3 className="text-lg font-bold">{employee?.position || '-'}</h3>
          )}
          {employee?.role && (
            <Badge variant="default" className="mt-1 bg-black text-white">
              {employee.role}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {renderField('Abteilung', employee?.department, 'department')}
          {renderField('Standort', employee?.location, 'location')}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {renderField('Arbeitsmodell', employee?.employment_type === 'full_time' ? 'Vollzeit' : employee?.employment_type === 'part_time' ? 'Teilzeit' : undefined)}
          {renderField('Wochenstunden', employee?.working_hours ? `${employee.working_hours}h` : undefined)}
        </div>
      </CardContent>
    </Card>
  );
};
