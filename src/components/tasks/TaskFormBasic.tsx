
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";

interface TaskFormBasicProps {
  title: string;
  description: string;
  dueDate: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
}

export const TaskFormBasic = ({
  title,
  description,
  dueDate,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
}: TaskFormBasicProps) => {
  // Konvertiere den String-Wert in ein Date-Objekt für den DatePicker
  const parsedDate = dueDate ? new Date(dueDate) : undefined;
  
  // Handler für Datumsänderungen vom DatePicker
  const handleDateChange = (date?: Date) => {
    if (date) {
      // ISO-String-Format beibehalten mit voller Zeitinformation
      onDueDateChange(date.toISOString());
      console.log("Fälligkeitsdatum aktualisiert:", date.toISOString());
    } else {
      onDueDateChange('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Aufgabentitel eingeben"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Beschreibung der Aufgabe..."
          rows={4}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
        <DatePicker
          date={parsedDate}
          onChange={handleDateChange}
          showTimeSelect={true}
          placeholder="Fälligkeitsdatum auswählen"
        />
      </div>
    </div>
  );
};
