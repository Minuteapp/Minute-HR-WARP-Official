
"use client";

import * as React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type Locale } from "date-fns";
import TimePickerContent from "@/components/time-tracking/TimePickerContent";

export interface DatePickerProps {
  date?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  showTimeSelect?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  locale?: Locale;
  setDate?: (date: Date) => void;
}

export function DatePicker({
  date,
  onChange,
  placeholder = "Datum auswählen",
  showTimeSelect = false,
  minDate,
  maxDate,
  disabled = false,
  className,
  locale = de,
  setDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [selectedTime, setSelectedTime] = React.useState<string>(
    date ? format(date, "HH:mm") : "00:00"
  );

  // Update selectedTime when date prop changes
  React.useEffect(() => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      setSelectedTime(format(date, "HH:mm"));
    }
  }, [date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Behalte die Zeit vom existierenden Datum oder vom selectedTime
      const hours = date ? date.getHours() : parseInt(selectedTime.split(':')[0]);
      const minutes = date ? date.getMinutes() : parseInt(selectedTime.split(':')[1]);
      
      selectedDate.setHours(hours || 0, minutes || 0, 0, 0);
      
      onChange(selectedDate);
      
      if (setDate) {
        setDate(selectedDate);
      }

      // Wenn die Zeitauswahl aktiviert ist, nach der Datumsauswahl die Zeitauswahl anzeigen
      if (showTimeSelect) {
        setShowTimePicker(true);
      } else {
        setIsOpen(false);
      }
    } else {
      onChange(undefined);
      setIsOpen(false);
    }
  };

  const handleTimeChange = (timeString: string) => {
    setSelectedTime(timeString);
    
    if (date) {
      const newDate = new Date(date);
      const [hours, minutes] = timeString.split(':').map(Number);
      newDate.setHours(hours || 0, minutes || 0, 0, 0);
      
      onChange(newDate);
      
      if (setDate) {
        setDate(newDate);
      }
    }
    
    // Timer hinzufügen, damit der Benutzer die ausgewählte Zeit sehen kann, bevor sich der Popover schließt
    setTimeout(() => {
      setShowTimePicker(false);
      setIsOpen(false);
    }, 250);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, showTimeSelect ? "PPp" : "PPP", { locale }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
        {!showTimePicker ? (
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            locale={locale}
            className="p-3 pointer-events-auto"
          />
        ) : (
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowTimePicker(false)}
              >
                Zurück
              </Button>
              <div className="text-xs font-medium">Uhrzeit auswählen</div>
              <div className="w-[60px]"></div> {/* Spacer für symmetrisches Layout */}
            </div>
            <div className="max-h-[200px] overflow-auto">
              <TimePickerContent
                value={selectedTime}
                onChange={handleTimeChange}
                hourStep={1}
                minuteStep={5}
              />
            </div>
          </div>
        )}
        
        {showTimeSelect && !showTimePicker && (
          <div className="border-t border-gray-200 p-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setShowTimePicker(true)}
            >
              <Clock className="mr-2 h-3 w-3" />
              {selectedTime ? `Uhrzeit: ${selectedTime}` : "Uhrzeit auswählen"}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
