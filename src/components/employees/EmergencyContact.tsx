
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Phone } from 'lucide-react';

interface EmergencyContactInfo {
  name: string;
  relation: string;
  phone: string;
}

interface EmergencyContactProps {
  contact: EmergencyContactInfo;
  isEditing?: boolean;
  onFieldChange?: (field: string, value: string) => void;
}

export const EmergencyContact = ({ 
  contact,
  isEditing = false,
  onFieldChange = () => {}
}: EmergencyContactProps) => {
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
    return <dd>{value}</dd>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notfallkontakt</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Name:
            </dt>
            {renderField(contact.name, (value) => onFieldChange('name', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Beziehung:
            </dt>
            {renderField(contact.relation, (value) => onFieldChange('relation', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefon:
            </dt>
            {renderField(contact.phone, (value) => onFieldChange('phone', value))}
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};
