
import { Input } from "@/components/ui/input";

interface ContactDataFormProps {
  email: string;
  sprache: 'Deutsch' | 'English';
  isEditing: boolean;
  onFieldChange: (field: string, value: string) => void;
}

export const ContactDataForm = ({
  email,
  sprache,
  isEditing,
  onFieldChange,
}: ContactDataFormProps) => {
  return (
    <>
      <h3 className="text-lg font-medium col-span-2 mt-4">Kontakt Daten</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">E-Mail</label>
          <Input 
            type="email"
            value={email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Sprache</label>
          <Input value="Deutsch" readOnly className="bg-gray-50" />
        </div>
      </div>
    </>
  );
};
