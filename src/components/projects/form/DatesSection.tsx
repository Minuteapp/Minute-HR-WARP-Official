
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DatesSectionProps {
  startDate: string;
  dueDate: string;
  onChange: (field: string, value: string) => void;
}

export const DatesSection = ({ startDate, dueDate, onChange }: DatesSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="startDate">Startdatum</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => onChange('startDate', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => onChange('dueDate', e.target.value)}
        />
      </div>
    </div>
  );
};
