
import { Input } from "@/components/ui/input";

interface MobileDataFormProps {
  provider: string;
  mobileRufnummer: string;
  isEditing: boolean;
  onFieldChange: (field: string, value: string) => void;
}

export const MobileDataForm = ({
  provider,
  mobileRufnummer,
  isEditing,
  onFieldChange,
}: MobileDataFormProps) => {
  return (
    <>
      <h3 className="text-lg font-medium col-span-2 mt-4">Mobilfunk Daten</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Provider</label>
          <Input 
            value={provider}
            onChange={(e) => onFieldChange('provider', e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Mobile Rufnummer</label>
          <Input 
            value={mobileRufnummer}
            onChange={(e) => onFieldChange('mobileRufnummer', e.target.value)}
            disabled={!isEditing}
          />
        </div>
      </div>
    </>
  );
};
