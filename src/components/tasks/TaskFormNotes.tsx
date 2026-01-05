
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TaskFormNotesProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export const TaskFormNotes = ({
  notes,
  onNotesChange,
}: TaskFormNotesProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notizen</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Notizen zur Aufgabe..."
      />
    </div>
  );
};
