
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from 'date-fns/locale';
import { useState } from "react";
import { CalendarIcon } from "lucide-react";

interface DatePickerProps {
  date: Date;
  onChange: (date: Date) => void;
  label: string;
}

const DatePicker = ({ date, onChange, label }: DatePickerProps) => {
  const [open, setOpen] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    // Keep the current time
    const newDate = new Date(date);
    newDate.setFullYear(selectedDate.getFullYear());
    newDate.setMonth(selectedDate.getMonth());
    newDate.setDate(selectedDate.getDate());
    
    onChange(newDate);
    setOpen(false);
  };

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, "PPP", { locale: de })}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0 bg-white z-50">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            locale={de}
            className="p-3 pointer-events-auto"
            weekStartsOn={1}
            showOutsideDays={true}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
