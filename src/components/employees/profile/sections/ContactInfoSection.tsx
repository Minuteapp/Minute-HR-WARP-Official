import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, AlertTriangle } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmployeeEditData } from "@/types/employee-profile.types";
import { renderFieldIfExists, renderEmptyState } from "@/utils/fieldRenderer";

interface ContactInfoSectionProps {
  employee: Employee | null;
  isEditing: boolean;
  editData?: EmployeeEditData | null;
  onFieldChange?: (section: keyof EmployeeEditData, field: string, value: string) => void;
}

export const ContactInfoSection = ({ employee, isEditing, editData, onFieldChange }: ContactInfoSectionProps) => {
  const renderEditableField = (label: string, field: string, value: string, type: string = "text", placeholder?: string) => (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onFieldChange?.('personalInfo', field, e.target.value)}
        placeholder={placeholder}
        className="h-9"
      />
    </div>
  );

  if (isEditing && editData) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Kontaktinformationen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderEditableField('E-Mail (geschäftlich)', 'email', editData.personalInfo.email, 'email', 'vorname.nachname@unternehmen.de')}
          {renderEditableField('Telefon (geschäftlich)', 'phone', editData.personalInfo.phone, 'tel', '+49 30 12345678')}
          {renderEditableField('Mobil (privat)', 'mobilePhone', editData.personalInfo.mobilePhone, 'tel', '+49 170 1234567')}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              Notfallkontakt
            </Label>
            <Input
              value={editData.emergencyContact.name}
              onChange={(e) => onFieldChange?.('emergencyContact', 'name', e.target.value)}
              placeholder="Name des Notfallkontakts"
              className="h-9"
            />
            <Input
              type="tel"
              value={editData.emergencyContact.phone}
              onChange={(e) => onFieldChange?.('emergencyContact', 'phone', e.target.value)}
              placeholder="Telefonnummer"
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
          <Phone className="h-4 w-4" />
          Kontaktinformationen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {renderFieldIfExists('E-Mail (geschäftlich)', employee?.email)}
        {renderFieldIfExists('Telefon (geschäftlich)', employee?.phone)}
        {renderFieldIfExists('Mobil (privat)', employee?.mobile_phone)}
        {renderFieldIfExists('Notfallkontakt', 
          employee?.emergency_contact_name && employee?.emergency_contact_phone 
            ? `${employee.emergency_contact_name}, ${employee.emergency_contact_phone}` 
            : null
        )}
        
        {!employee?.email && !employee?.phone && !employee?.mobile_phone && !employee?.emergency_contact_name && (
          renderEmptyState("Keine Kontaktinformationen vorhanden.")
        )}
      </CardContent>
    </Card>
  );
};
