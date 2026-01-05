
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

interface TimePickerContentProps {
  value: string;
  onChange: (value: string) => void;
  hourStep?: number;
  minuteStep?: number;
}

const TimePickerContent = ({
  value,
  onChange,
  hourStep = 1,
  minuteStep = 5,
}: TimePickerContentProps) => {
  const [hours, minutes] = value ? value.split(':').map(Number) : [0, 0];
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  
  const handleHourChange = (newHour: number) => {
    const validHour = Math.max(0, Math.min(23, newHour));
    onChange(`${String(validHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
  };

  const handleMinuteChange = (newMinute: number) => {
    const validMinute = Math.max(0, Math.min(59, newMinute));
    onChange(`${String(hours).padStart(2, '0')}:${String(validMinute).padStart(2, '0')}`);
  };

  // Scroll to selected hour and minute when component mounts
  useEffect(() => {
    if (hoursRef.current && minutesRef.current) {
      const hourElement = hoursRef.current.querySelector(`[data-hour="${hours}"]`);
      const minuteElement = minutesRef.current.querySelector(`[data-minute="${minutes}"]`);
      
      if (hourElement) {
        hoursRef.current.scrollTop = (hourElement as HTMLElement).offsetTop - hoursRef.current.offsetTop - 40;
      }
      
      if (minuteElement) {
        minutesRef.current.scrollTop = (minuteElement as HTMLElement).offsetTop - minutesRef.current.offsetTop - 40;
      }
    }
  }, [hours, minutes]);

  // Generate hour options
  const hourOptions = [];
  for (let i = 0; i < 24; i += hourStep) {
    hourOptions.push(i);
  }

  // Generate minute options
  const minuteOptions = [];
  for (let i = 0; i < 60; i += minuteStep) {
    minuteOptions.push(i);
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <div className="text-sm font-medium mb-2">Stunden</div>
          <div 
            ref={hoursRef}
            className="h-[120px] overflow-y-auto flex flex-col w-full rounded-md border border-gray-200 custom-scrollbar"
          >
            {hourOptions.map((hour) => (
              <Button
                key={hour}
                data-hour={hour}
                variant={hour === hours ? "default" : "ghost"}
                onClick={() => handleHourChange(hour)}
                className="rounded-none justify-center"
              >
                {String(hour).padStart(2, '0')}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-sm font-medium mb-2">Minuten</div>
          <div 
            ref={minutesRef}
            className="h-[120px] overflow-y-auto flex flex-col w-full rounded-md border border-gray-200 custom-scrollbar"
          >
            {minuteOptions.map((minute) => (
              <Button
                key={minute}
                data-minute={minute}
                variant={minute === minutes ? "default" : "ghost"}
                onClick={() => handleMinuteChange(minute)}
                className="rounded-none justify-center"
              >
                {String(minute).padStart(2, '0')}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePickerContent;
