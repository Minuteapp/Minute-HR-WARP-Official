
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface TaskFormReminderProps {
  reminder: string;
  onReminderChange: (value: string) => void;
}

export const TaskFormReminder = ({
  reminder,
  onReminderChange,
}: TaskFormReminderProps) => {
  // Konvertiere den String-Wert in ein Date-Objekt für den DatePicker
  const [parsedDate, setParsedDate] = useState<Date | undefined>(
    reminder ? new Date(reminder) : undefined
  );
  
  useEffect(() => {
    // Wenn sich das reminder-Prop ändert, aktualisiere das parsedDate
    if (reminder) {
      try {
        setParsedDate(new Date(reminder));
      } catch (e) {
        console.error("Ungültiges Datumsformat für Erinnerung:", reminder);
        setParsedDate(undefined);
      }
    } else {
      setParsedDate(undefined);
    }
  }, [reminder]);
  
  // Handler für Datumsänderungen vom DatePicker
  const handleDateChange = (date?: Date) => {
    if (date) {
      // ISO-String-Format beibehalten und sicherstellen, dass Zeit korrekt übernommen wird
      const isoString = date.toISOString();
      onReminderChange(isoString);
      setParsedDate(date);
    } else {
      onReminderChange('');
      setParsedDate(undefined);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="reminder">Erinnerung</Label>
      <DatePicker
        date={parsedDate}
        onChange={handleDateChange}
        showTimeSelect={true}
        placeholder="Erinnerungsdatum auswählen"
      />
    </div>
  );
};
