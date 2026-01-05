
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import TimePickerContent from "@/components/time-tracking/TimePickerContent";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface TimePickerProps {
  date: Date;
  onChange: (date: Date) => void;
  label: string;
  className?: string;
}

const TimePicker = ({ date, onChange, label, className }: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const [timeInput, setTimeInput] = useState(format(date, "HH:mm"));

  // Update timeInput when date prop changes
  useEffect(() => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      setTimeInput(format(date, "HH:mm"));
    }
  }, [date]);

  const handleTimeChange = (timeString: string) => {
    if (!timeString) return;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    
    if (!isNaN(hours) && hours >= 0 && hours < 24) {
      newDate.setHours(hours);
    }
    if (!isNaN(minutes) && minutes >= 0 && minutes < 60) {
      newDate.setMinutes(minutes);
    }
    
    onChange(newDate);
    setTimeInput(format(newDate, "HH:mm"));
    setOpen(false);
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimeInput(value);
    
    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(value)) {
      handleTimeChange(value);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <Input
          value={timeInput}
          onChange={handleDirectInput}
          placeholder="HH:MM"
          className="w-full text-center"
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="px-2"
              type="button"
            >
              <Clock className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-0 w-[280px] z-50 border border-gray-200 shadow-lg rounded-md">
            <div className="p-4 bg-white">
              <TimePickerContent
                value={timeInput}
                onChange={handleTimeChange}
                hourStep={1}
                minuteStep={5}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default TimePicker;
