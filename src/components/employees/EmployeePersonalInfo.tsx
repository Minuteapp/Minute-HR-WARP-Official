
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Calendar, Flag, Mail, Phone, MapPin } from 'lucide-react';
import { NationalitySelect } from "@/components/ui/nationality-select";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface PersonalInformation {
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  secondNationality?: string;
  email: string;
  phone: string;
  mobilePhone: string;
  address: Address;
}

interface EmployeePersonalInfoProps {
  employee: PersonalInformation;
  isEditing?: boolean;
  onFieldChange?: (field: string, value: string) => void;
  onAddressChange?: (field: string, value: string) => void;
}

export const EmployeePersonalInfo = ({ 
  employee, 
  isEditing = false,
  onFieldChange = () => {},
  onAddressChange = () => {}
}: EmployeePersonalInfoProps) => {
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
    return <dd className="text-gray-700">{value || '-'}</dd>;
  };

  const renderNationalityField = (value: string, onChange: (value: string) => void) => {
    if (isEditing) {
      return (
        <NationalitySelect
          value={value}
          onValueChange={onChange}
          placeholder="Nationalität auswählen"
        />
      );
    }
    return <dd className="text-gray-700">{value || '-'}</dd>;
  };

  const renderAddressField = (value: string, onChange: (value: string) => void) => {
    if (isEditing) {
      return (
        <AddressAutocomplete
          value={value}
          onChange={onChange}
          onAddressSelect={(address) => {
            onAddressChange('street', address.street);
            onAddressChange('city', address.city);
            onAddressChange('postalCode', address.postalCode);
            onAddressChange('country', address.country);
          }}
          placeholder="Adresse eingeben..."
          className="max-w-[300px]"
        />
      );
    }
    return <dd className="text-gray-700">{value || '-'}</dd>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Persönliche Informationen</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Vorname:
            </dt>
            {renderField(employee.firstName, (value) => onFieldChange('firstName', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Nachname:
            </dt>
            {renderField(employee.lastName, (value) => onFieldChange('lastName', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Geburtsdatum:
            </dt>
            {renderField(employee.birthDate, (value) => onFieldChange('birthDate', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Nationalität:
            </dt>
            {renderNationalityField(employee.nationality, (value) => onFieldChange('nationality', value))}
          </div>
          {(isEditing || employee.secondNationality) && (
            <div className="flex justify-between items-center">
              <dt className="font-medium flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Zweite Nationalität:
              </dt>
              {renderNationalityField(employee.secondNationality || '', (value) => onFieldChange('secondNationality', value))}
            </div>
          )}
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email:
            </dt>
            {renderField(employee.email, (value) => onFieldChange('email', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefon:
            </dt>
            {renderField(employee.phone, (value) => onFieldChange('phone', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Mobil:
            </dt>
            {renderField(employee.mobilePhone, (value) => onFieldChange('mobilePhone', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Straße:
            </dt>
            {renderAddressField(employee.address.street, (value) => onAddressChange('street', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              PLZ:
            </dt>
            {renderField(employee.address.postalCode, (value) => onAddressChange('postalCode', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Stadt:
            </dt>
            {renderField(employee.address.city, (value) => onAddressChange('city', value))}
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Land:
            </dt>
            {renderField(employee.address.country, (value) => onAddressChange('country', value))}
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};
