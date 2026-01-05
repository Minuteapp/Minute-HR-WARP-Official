
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { format } from "date-fns";

interface TimeSelectorProps {
  value: string;
  onSelect: (time: string) => void;
  label: string;
}

const TimeSelector = ({ value, onSelect, label }: TimeSelectorProps) => {
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      timeOptions.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      );
    }
  }

  const getFormattedTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return "Zeit wählen";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground",
            "border-[#33C3F0] hover:border-[#33C3F0]/80 focus-visible:ring-[#33C3F0]"
          )}
        >
          <Clock className="mr-2 h-4 w-4 text-[#33C3F0]" />
          {value ? getFormattedTime(value) : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="start">
        <div className="flex flex-col h-48 overflow-y-auto">
          {timeOptions.map((time) => (
            <Button
              key={time}
              variant="ghost"
              className="justify-start font-normal hover:text-[#33C3F0] hover:bg-[#33C3F0]/5"
              onClick={() => onSelect(time)}
            >
              {time}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimeSelector;
