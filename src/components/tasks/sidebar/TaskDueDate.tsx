
import { DatePicker } from "@/components/ui/date-picker";

interface TaskDueDateProps {
  dueDate: string;
  onDueDateChange: (value: string) => void;
}

export const TaskDueDate = ({ dueDate, onDueDateChange }: TaskDueDateProps) => {
  // Konvertiere den String-Wert in ein Date-Objekt für den DatePicker
  const parsedDate = dueDate ? new Date(dueDate) : undefined;
  
  // Handler für Datumsänderungen vom DatePicker
  const handleDateChange = (date?: Date) => {
    if (date) {
      // ISO-String-Format beibehalten
      onDueDateChange(date.toISOString());
    } else {
      onDueDateChange('');
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Fälligkeitsdatum</h3>
      <DatePicker
        date={parsedDate}
        onChange={handleDateChange}
        showTimeSelect={true}
        placeholder="Fälligkeitsdatum auswählen"
      />
    </div>
  );
};
