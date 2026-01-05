
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonalDataFormProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    language: string;
    timezone: string;
  };
  isEditing: boolean;
  onChange: (data: any) => void;
}

export const PersonalDataForm = ({ formData, isEditing, onChange }: PersonalDataFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        {isEditing ? (
          <Input
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            placeholder="Vollständiger Name"
          />
        ) : (
          <div className="p-2 bg-gray-50 rounded">{formData.name}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label>E-Mail</Label>
        {isEditing ? (
          <Input
            value={formData.email}
            onChange={(e) => onChange({ ...formData, email: e.target.value })}
            placeholder="E-Mail Adresse"
          />
        ) : (
          <div className="p-2 bg-gray-50 rounded">{formData.email}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Telefon</Label>
        {isEditing ? (
          <Input
            value={formData.phone}
            onChange={(e) => onChange({ ...formData, phone: e.target.value })}
            placeholder="Telefonnummer"
          />
        ) : (
          <div className="p-2 bg-gray-50 rounded">{formData.phone}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Abteilung</Label>
        {isEditing ? (
          <Input
            value={formData.department}
            onChange={(e) => onChange({ ...formData, department: e.target.value })}
            placeholder="Abteilung"
          />
        ) : (
          <div className="p-2 bg-gray-50 rounded">{formData.department}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Position</Label>
        {isEditing ? (
          <Input
            value={formData.position}
            onChange={(e) => onChange({ ...formData, position: e.target.value })}
            placeholder="Position"
          />
        ) : (
          <div className="p-2 bg-gray-50 rounded">{formData.position}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Sprache</Label>
        <Select 
          value={formData.language || "de"}
          onValueChange={(value) => onChange({ ...formData, language: value })}
          disabled={!isEditing}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sprache wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="de">Deutsch</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Zeitzone</Label>
        <Select 
          value={formData.timezone || "europe-berlin"}
          onValueChange={(value) => onChange({ ...formData, timezone: value })}
          disabled={!isEditing}
        >
          <SelectTrigger>
            <SelectValue placeholder="Zeitzone wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="europe-berlin">Europe/Berlin</SelectItem>
            <SelectItem value="europe-london">Europe/London</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
