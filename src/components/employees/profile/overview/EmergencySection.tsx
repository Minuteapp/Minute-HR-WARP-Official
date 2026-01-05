
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, User, Heart } from "lucide-react";

interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

interface EmergencySectionProps {
  emergencyContact: EmergencyContact;
  isEditing: boolean;
  onFieldChange: (field: string, value: string) => void;
}

export const EmergencySection = ({
  emergencyContact,
  isEditing,
  onFieldChange
}: EmergencySectionProps) => {
  return (
    <Card className="border-gray-200 shadow-sm hover:shadow transition-shadow">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-medium">Notfallkontakt</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium flex items-center gap-1.5">
              <User className="h-3 w-3 text-gray-500" />
              Name
            </Label>
            <Input
              id="name"
              value={emergencyContact.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              disabled={!isEditing}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="relation" className="text-xs font-medium flex items-center gap-1.5">
              <Heart className="h-3 w-3 text-gray-500" />
              Beziehung
            </Label>
            <Input
              id="relation"
              value={emergencyContact.relation}
              onChange={(e) => onFieldChange('relation', e.target.value)}
              disabled={!isEditing}
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-gray-500" />
            Telefonnummer
          </Label>
          <Input
            id="phone"
            value={emergencyContact.phone}
            onChange={(e) => onFieldChange('phone', e.target.value)}
            disabled={!isEditing}
            className="h-8 text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};
