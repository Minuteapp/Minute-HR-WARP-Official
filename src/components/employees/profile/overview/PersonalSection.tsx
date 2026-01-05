import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { NationalitySelect } from "@/components/ui/nationality-select";
import { PersonalInfo } from "@/types/employee-profile.types";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

interface PersonalSectionProps {
  personalInfo: PersonalInfo;
  isEditing: boolean;
  onFieldChange: (field: string, value: string) => void;
  onAddressChange: (field: string, value: string) => void;
}

export const PersonalSection = ({
  personalInfo,
  isEditing,
  onFieldChange,
  onAddressChange
}: PersonalSectionProps) => {
  return (
    <Card className="border-gray-200 shadow-sm hover:shadow transition-shadow">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Persönliche Informationen
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-xs font-medium">Vorname</Label>
            <Input
              id="firstName"
              value={personalInfo.firstName}
              onChange={(e) => onFieldChange('firstName', e.target.value)}
              disabled={!isEditing}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-xs font-medium">Nachname</Label>
            <Input
              id="lastName"
              value={personalInfo.lastName}
              onChange={(e) => onFieldChange('lastName', e.target.value)}
              disabled={!isEditing}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="birthDate" className="text-xs font-medium">Geburtsdatum</Label>
            <DatePicker
              date={personalInfo.birthDate ? new Date(personalInfo.birthDate) : undefined}
              onChange={(date) => onFieldChange('birthDate', date ? date.toISOString().split('T')[0] : '')}
              disabled={!isEditing}
              placeholder="Geburtsdatum auswählen"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nationality" className="text-xs font-medium">Nationalität</Label>
            <NationalitySelect
              value={personalInfo.nationality}
              onValueChange={(value) => onFieldChange('nationality', value)}
              disabled={!isEditing}
              placeholder="Nationalität auswählen"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="secondNationality" className="text-xs font-medium">Zweite Nationalität (optional)</Label>
          <NationalitySelect
            value={personalInfo.secondNationality || ''}
            onValueChange={(value) => onFieldChange('secondNationality', value)}
            disabled={!isEditing}
            placeholder="Zweite Nationalität auswählen"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={personalInfo.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              disabled={!isEditing}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-medium">Telefon</Label>
            <Input
              id="phone"
              value={personalInfo.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              disabled={!isEditing}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mobilePhone" className="text-xs font-medium">Mobiltelefon</Label>
          <Input
            id="mobilePhone"
            value={personalInfo.mobilePhone}
            onChange={(e) => onFieldChange('mobilePhone', e.target.value)}
            disabled={!isEditing}
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Adresse</Label>
          <div className="space-y-2">
            {isEditing && (
              <AddressAutocomplete
                value=""
                onChange={() => {}}
                onAddressSelect={(addressData) => {
                  onAddressChange('street', addressData.street);
                  onAddressChange('city', addressData.city);
                  onAddressChange('postalCode', addressData.postalCode);
                  onAddressChange('country', addressData.country);
                }}
                placeholder="Adresse suchen..."
                className="h-8 text-sm"
              />
            )}
            <Input
              placeholder="Straße"
              value={personalInfo.address.street}
              onChange={(e) => onAddressChange('street', e.target.value)}
              disabled={!isEditing}
              className="h-8 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="PLZ"
                value={personalInfo.address.postalCode}
                onChange={(e) => onAddressChange('postalCode', e.target.value)}
                disabled={!isEditing}
                className="h-8 text-sm"
              />
              <Input
                placeholder="Stadt"
                value={personalInfo.address.city}
                onChange={(e) => onAddressChange('city', e.target.value)}
                disabled={!isEditing}
                className="h-8 text-sm"
              />
            </div>
            <Input
              placeholder="Land"
              value={personalInfo.address.country}
              onChange={(e) => onAddressChange('country', e.target.value)}
              disabled={!isEditing}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};