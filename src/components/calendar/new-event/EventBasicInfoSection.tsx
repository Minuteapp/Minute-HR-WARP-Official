
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventBasicInfoSectionProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  color?: string;
  onColorChange?: (color: string) => void;
}

const EventBasicInfoSection = ({ 
  title, 
  onTitleChange,
  color = "blue",
  onColorChange 
}: EventBasicInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          value={title}
          onChange={onTitleChange}
          placeholder="Meeting mit Team"
          className="mt-1 border-gray-300"
        />
      </div>

      {onColorChange && (
        <div>
          <Label htmlFor="color">Farbe</Label>
          <Select value={color} onValueChange={onColorChange}>
            <SelectTrigger id="color" className="mt-1">
              <SelectValue placeholder="Farbe auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blue">Blau</SelectItem>
              <SelectItem value="green">Grün</SelectItem>
              <SelectItem value="red">Rot</SelectItem>
              <SelectItem value="purple">Lila</SelectItem>
              <SelectItem value="pink">Pink</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="yellow">Gelb</SelectItem>
              <SelectItem value="indigo">Indigo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default EventBasicInfoSection;
