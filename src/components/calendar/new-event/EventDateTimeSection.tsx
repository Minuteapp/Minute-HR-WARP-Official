
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { de } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { TimePickerDemo } from "@/components/ui/time-picker-demo";

interface EventDateTimeSectionProps {
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onAllDayChange: (checked: boolean) => void;
}

const EventDateTimeSection = ({
  startDate,
  endDate,
  isAllDay,
  onStartDateChange,
  onEndDateChange,
  onAllDayChange
}: EventDateTimeSectionProps) => {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id="all-day" 
          checked={isAllDay}
          onCheckedChange={onAllDayChange}
        />
        <Label htmlFor="all-day">Ganztägig</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Startdatum und -zeit</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: de }) : "Datum auswählen"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    if (date) {
                      const newDate = new Date(startDate);
                      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                      onStartDateChange(newDate);
                      setStartOpen(false);
                    }
                  }}
                  locale={de}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            {!isAllDay && (
              <div className="flex items-center space-x-2">
                <TimePickerDemo 
                  date={startDate} 
                  setDate={(date) => onStartDateChange(date)} 
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Enddatum und -zeit</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: de }) : "Datum auswählen"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    if (date) {
                      const newDate = new Date(endDate);
                      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                      onEndDateChange(newDate);
                      setEndOpen(false);
                    }
                  }}
                  locale={de}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            {!isAllDay && (
              <div className="flex items-center space-x-2">
                <TimePickerDemo 
                  date={endDate} 
                  setDate={(date) => onEndDateChange(date)} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDateTimeSection;
