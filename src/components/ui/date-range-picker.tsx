
import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { de } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  from: Date;
  to: Date;
  onSelect: (range: DateRange | undefined) => void;
  className?: string;
}

interface DatePickerWithRangeProps {
  date?: { from: Date; to: Date };
  onDateChange?: (range: { from: Date; to: Date } | undefined) => void;
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  onSelect,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from,
    to,
  });

  const handleSelect = (range?: DateRange) => {
    setDate(range);
    onSelect(range);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd.MM.yyyy", { locale: de })} -{" "}
                  {format(date.to, "dd.MM.yyyy", { locale: de })}
                </>
              ) : (
                format(date.from, "dd.MM.yyyy", { locale: de })
              )
            ) : (
              <span>Zeitraum auswählen</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={de}
            className={cn("p-3 pointer-events-auto")}
          />
          <div className="flex items-center justify-between p-3 border-t">
            <div className="space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const today = new Date();
                  handleSelect({
                    from: today,
                    to: today,
                  });
                }}
              >
                Heute
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const today = new Date();
                  const weekStart = addDays(today, -7);
                  handleSelect({
                    from: weekStart,
                    to: today,
                  });
                }}
              >
                Letzte Woche
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const today = new Date();
                  const monthStart = addDays(today, -30);
                  handleSelect({
                    from: monthStart,
                    to: today,
                  });
                }}
              >
                Letzter Monat
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function DatePickerWithRange({
  date,
  onDateChange,
  className,
}: DatePickerWithRangeProps) {
  const [selectedDate, setSelectedDate] = React.useState<DateRange | undefined>(
    date ? { from: date.from, to: date.to } : undefined
  );

  const handleSelect = (range?: DateRange) => {
    setSelectedDate(range);
    if (range?.from && range?.to) {
      onDateChange?.({ from: range.from, to: range.to });
    } else {
      onDateChange?.(undefined);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate?.from ? (
              selectedDate.to ? (
                <>
                  {format(selectedDate.from, "dd.MM.yyyy", { locale: de })} -{" "}
                  {format(selectedDate.to, "dd.MM.yyyy", { locale: de })}
                </>
              ) : (
                format(selectedDate.from, "dd.MM.yyyy", { locale: de })
              )
            ) : (
              <span>Zeitraum auswählen</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedDate?.from}
            selected={selectedDate}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={de}
            className={cn("p-3 pointer-events-auto")}
          />
          <div className="flex items-center justify-between p-3 border-t">
            <div className="space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const today = new Date();
                  handleSelect({
                    from: today,
                    to: today,
                  });
                }}
              >
                Heute
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const today = new Date();
                  const weekStart = addDays(today, -7);
                  handleSelect({
                    from: weekStart,
                    to: today,
                  });
                }}
              >
                Letzte Woche
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const today = new Date();
                  const monthStart = addDays(today, -30);
                  handleSelect({
                    from: monthStart,
                    to: today,
                  });
                }}
              >
                Letzter Monat
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
