
import { DatePicker } from "@/components/ui/date-picker";
import { Clock } from "lucide-react";

interface TaskReminderProps {
  reminderDate: string;
  onReminderDateChange: (value: string) => void;
}

export const TaskReminder = ({
  reminderDate,
  onReminderDateChange,
}: TaskReminderProps) => {
  // Konvertiere den String-Wert in ein Date-Objekt für den DatePicker
  const parsedDate = reminderDate ? new Date(reminderDate) : undefined;
  
  // Handler für Datumsänderungen vom DatePicker
  const handleDateChange = (date?: Date) => {
    if (date) {
      // ISO-String-Format beibehalten mit voller Zeitinformation
      onReminderDateChange(date.toISOString());
      console.log("Erinnerungsdatum aktualisiert:", date.toISOString());
    } else {
      onReminderDateChange('');
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-1">
        <Clock className="h-4 w-4 text-[#9b87f5]" />
        Erinnerung
      </h3>
      <DatePicker
        date={parsedDate}
        onChange={handleDateChange}
        showTimeSelect={true}
        placeholder="Erinnerung festlegen"
      />
    </div>
  );
};
