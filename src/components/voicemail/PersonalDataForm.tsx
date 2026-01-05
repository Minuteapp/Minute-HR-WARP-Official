
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Salutation = "Herr" | "Frau" | "Divers";

interface PersonalFormProps {
  anrede: string;
  akademischerTitel: string;
  vorname: string;
  nachname: string;
  gesprochenWie: string;
  isEditing: boolean;
  onFieldChange: (field: string, value: string) => void;
}

export const PersonalDataForm = ({
  anrede,
  akademischerTitel,
  vorname,
  nachname,
  gesprochenWie,
  isEditing,
  onFieldChange,
}: PersonalFormProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Anrede</label>
          <Select
            value={anrede}
            onValueChange={(value: Salutation) => onFieldChange('anrede', value)}
            disabled={!isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Bitte wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Herr">Herr</SelectItem>
              <SelectItem value="Frau">Frau</SelectItem>
              <SelectItem value="Divers">Divers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Akademischer Titel</label>
          <Input 
            value={akademischerTitel}
            onChange={(e) => onFieldChange('akademischerTitel', e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Vorname</label>
          <Input 
            value={vorname}
            onChange={(e) => onFieldChange('vorname', e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nachname</label>
          <Input 
            value={nachname}
            onChange={(e) => onFieldChange('nachname', e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium">Gesprochen wie</label>
          <Input 
            value={gesprochenWie}
            onChange={(e) => onFieldChange('gesprochenWie', e.target.value)}
            disabled={!isEditing}
          />
        </div>
      </div>
    </>
  );
};
