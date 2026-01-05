import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeEditData } from "@/types/employee-profile.types";
import { renderFieldIfExists, renderEmptyState } from "@/utils/fieldRenderer";

interface TaxSectionProps {
  employee: Employee | null;
  isEditing: boolean;
  editData?: EmployeeEditData | null;
  onFieldChange?: (section: keyof EmployeeEditData, field: string, value: string) => void;
}

export const TaxSection = ({ employee, isEditing, editData, onFieldChange }: TaxSectionProps) => {

  const renderEditableField = (label: string, field: string, value: string, placeholder?: string) => (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onFieldChange?.('employmentInfo', field, e.target.value)}
        placeholder={placeholder}
        className="h-9"
      />
    </div>
  );

  const maskSensitiveData = (data: string | undefined) => {
    if (!data) return '-';
    const visible = data.slice(-3);
    return `•••-•••-•${visible}`;
  };

  if (isEditing && editData) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sozialversicherung & Steuern
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderEditableField('Sozialversicherungsnummer', 'socialSecurityNumber', editData.employmentInfo.socialSecurityNumber, '12 345678 A 123')}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Steuerklasse</Label>
            <Select
              value={editData.employmentInfo.taxClass || ''}
              onValueChange={(value) => onFieldChange?.('employmentInfo', 'taxClass', value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Steuerklasse wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="I">Klasse I</SelectItem>
                <SelectItem value="II">Klasse II</SelectItem>
                <SelectItem value="III">Klasse III</SelectItem>
                <SelectItem value="IV">Klasse IV</SelectItem>
                <SelectItem value="V">Klasse V</SelectItem>
                <SelectItem value="VI">Klasse VI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {renderEditableField('Steuer-ID', 'taxId', editData.employmentInfo.taxId, '12 345 678 901')}
          {renderEditableField('Krankenkasse', 'healthInsurance', editData.employmentInfo.healthInsurance || '', 'TK - Techniker Krankenkasse')}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Sozialversicherung & Steuern
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {employee?.social_security_number && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-muted-foreground">Sozialversicherungsnummer</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{maskSensitiveData(employee.social_security_number)}</span>
              <Badge variant="outline" className="text-xs">Geschützt</Badge>
            </div>
          </div>
        )}
        {renderFieldIfExists('Steuerklasse', (employee as any)?.tax_class)}
        {renderFieldIfExists('Steuer-ID', employee?.tax_id)}
        {renderFieldIfExists('Krankenkasse', (employee as any)?.health_insurance)}
        
        {!employee?.social_security_number && !(employee as any)?.tax_class && !employee?.tax_id && !(employee as any)?.health_insurance && (
          renderEmptyState("Keine Steuer- und Sozialversicherungsdaten vorhanden.")
        )}
      </CardContent>
    </Card>
  );
};
