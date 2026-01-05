
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EventDescriptionSectionProps {
  description: string | undefined;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const EventDescriptionSection = ({ 
  description, 
  onDescriptionChange 
}: EventDescriptionSectionProps) => {
  return (
    <div>
      <Label htmlFor="description">Beschreibung</Label>
      <Textarea
        id="description"
        value={description || ""}
        onChange={onDescriptionChange}
        placeholder="Beschreibung des Termins"
        className="mt-1 border-gray-300 h-24"
      />
    </div>
  );
};

export default EventDescriptionSection;
