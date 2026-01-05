
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimePickerDemoProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function TimePickerDemo({ date, setDate }: TimePickerDemoProps) {
  const [timeValue, setTimeValue] = useState(
    `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  );

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeValue(e.target.value);
    
    if (e.target.value) {
      const [hours, minutes] = e.target.value.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours || 0);
      newDate.setMinutes(minutes || 0);
      setDate(newDate);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" disabled type="button">
        <Clock className="h-4 w-4" />
      </Button>
      <Input
        type="time"
        value={timeValue}
        onChange={handleTimeChange}
        className="w-[110px]"
      />
    </div>
  );
}
