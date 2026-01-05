import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeEditData } from "@/types/employee-profile.types";
import { renderFieldIfExists, renderEmptyState } from "@/utils/fieldRenderer";

interface PersonalDataSectionProps {
  employee: Employee | null;
  isEditing: boolean;
  editData?: EmployeeEditData | null;
  onFieldChange?: (section: keyof EmployeeEditData, field: string, value: string) => void;
}

export const PersonalDataSection = ({ employee, isEditing, editData, onFieldChange }: PersonalDataSectionProps) => {

  const renderEditableField = (label: string, field: string, value: string, type: string = "text") => (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onFieldChange?.('personalInfo', field, e.target.value)}
        className="h-9"
      />
    </div>
  );

  if (isEditing && editData) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Persönliche Stammdaten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {renderEditableField('Vorname', 'firstName', editData.personalInfo.firstName)}
            {renderEditableField('Nachname', 'lastName', editData.personalInfo.lastName)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {renderEditableField('Geburtsdatum', 'birthDate', editData.personalInfo.birthDate, 'date')}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Geschlecht</Label>
              <Select
                value={editData.personalInfo.gender || ''}
                onValueChange={(value) => onFieldChange?.('personalInfo', 'gender', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Geschlecht wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Männlich</SelectItem>
                  <SelectItem value="female">Weiblich</SelectItem>
                  <SelectItem value="diverse">Divers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {renderEditableField('Nationalität', 'nationality', editData.personalInfo.nationality)}
            {renderEditableField('Zweite Nationalität', 'secondNationality', editData.personalInfo.secondNationality || '')}
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Adresse</Label>
            <Input
              value={editData.personalInfo.address.street}
              onChange={(e) => onFieldChange?.('personalInfo', 'address.street', e.target.value)}
              placeholder="Straße und Hausnummer"
              className="h-9"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={editData.personalInfo.address.postalCode}
                onChange={(e) => onFieldChange?.('personalInfo', 'address.postalCode', e.target.value)}
                placeholder="PLZ"
                className="h-9"
              />
              <Input
                value={editData.personalInfo.address.city}
                onChange={(e) => onFieldChange?.('personalInfo', 'address.city', e.target.value)}
                placeholder="Stadt"
                className="h-9"
              />
            </div>
            <Input
              value={editData.personalInfo.address.country}
              onChange={(e) => onFieldChange?.('personalInfo', 'address.country', e.target.value)}
              placeholder="Land"
              className="h-9"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <User className="h-4 w-4" />
          Persönliche Stammdaten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="grid grid-cols-2 gap-x-8">
          <div>
            {renderFieldIfExists('Vorname', employee?.first_name)}
          </div>
          <div>
            {renderFieldIfExists('Nachname', employee?.last_name)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8">
          <div>
            {renderFieldIfExists('Geburtsdatum', employee?.birth_date ? new Date(employee.birth_date).toLocaleDateString('de-DE') : null)}
          </div>
          <div>
            {renderFieldIfExists('Geschlecht', 
              (employee as any)?.gender === 'male' ? 'Männlich' : 
              (employee as any)?.gender === 'female' ? 'Weiblich' : 
              (employee as any)?.gender === 'diverse' ? 'Divers' : null
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8">
          <div>
            {renderFieldIfExists('Nationalität', employee?.nationality)}
          </div>
          <div>
            {renderFieldIfExists('Adresse', 
              employee?.street && employee?.city 
                ? `${employee.street}, ${employee.postal_code} ${employee.city}` 
                : null
            )}
          </div>
        </div>
        
        {!employee?.first_name && !employee?.last_name && !employee?.birth_date && !employee?.nationality && !employee?.street && (
          renderEmptyState("Keine persönlichen Daten vorhanden. Bitte bearbeiten Sie das Profil.")
        )}
      </CardContent>
    </Card>
  );
};
