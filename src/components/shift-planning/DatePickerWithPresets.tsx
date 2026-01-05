
import * as React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DatePickerWithPresetsProps {
  date: Date;
  onChange: (date: Date) => void;
}

export function DatePickerWithPresets({ date, onChange }: DatePickerWithPresetsProps) {
  const [selectedMonth, setSelectedMonth] = React.useState<number>(date.getMonth());
  const [selectedYear, setSelectedYear] = React.useState<number>(date.getFullYear());

  React.useEffect(() => {
    // Update internal state when date prop changes
    setSelectedMonth(date.getMonth());
    setSelectedYear(date.getFullYear());
  }, [date]);

  const handleMonthChange = (value: string) => {
    const month = parseInt(value, 10);
    setSelectedMonth(month);
    const newDate = new Date(date);
    newDate.setMonth(month);
    onChange(newDate);
  };

  const handleYearChange = (value: string) => {
    const year = parseInt(value, 10);
    setSelectedYear(year);
    const newDate = new Date(date);
    newDate.setFullYear(year);
    onChange(newDate);
  };

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 3 + i;
    return { label: year.toString(), value: year };
  });

  const months = Array.from({ length: 12 }, (_, i) => {
    return {
      label: format(new Date(2000, i, 1), "MMMM", { locale: de }),
      value: i,
    };
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: de }) : <span>Datum auswählen</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        <div className="flex gap-2">
          <Select
            value={selectedMonth.toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Monat" />
            </SelectTrigger>
            <SelectContent position="popper">
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedYear.toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Jahr" />
            </SelectTrigger>
            <SelectContent position="popper">
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value.toString()}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(day) => day && onChange(day)}
            month={new Date(selectedYear, selectedMonth)}
            onMonthChange={(month) => {
              setSelectedMonth(month.getMonth());
              setSelectedYear(month.getFullYear());
            }}
            locale={de}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
