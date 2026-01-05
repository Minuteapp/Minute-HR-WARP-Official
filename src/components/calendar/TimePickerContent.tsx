
import { useState, useRef, useEffect } from "react";

interface TimePickerContentProps {
  hours: number;
  minutes: number;
  onChange: (hours: number, minutes: number) => void;
}

const TimePickerContent = ({ hours, minutes, onChange }: TimePickerContentProps) => {
  const [selectedHour, setSelectedHour] = useState(hours);
  const [selectedMinute, setSelectedMinute] = useState(minutes);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scrolle zu den ausgewählten Werten, wenn die Komponente geladen wird
    if (hourListRef.current) {
      const hourElement = hourListRef.current.querySelector(`[data-hour="${selectedHour}"]`);
      if (hourElement) {
        hourElement.scrollIntoView({ block: 'center' });
      }
    }
    
    if (minuteListRef.current) {
      const minuteElement = minuteListRef.current.querySelector(`[data-minute="${selectedMinute}"]`);
      if (minuteElement) {
        minuteElement.scrollIntoView({ block: 'center' });
      }
    }
  }, [selectedHour, selectedMinute]);

  const handleHourChange = (hour: number) => {
    setSelectedHour(hour);
    onChange(hour, selectedMinute);
  };

  const handleMinuteChange = (minute: number) => {
    setSelectedMinute(minute);
    onChange(selectedHour, minute);
  };

  return (
    <div className="flex flex-col space-y-2 w-[240px]">
      <div className="grid grid-cols-2 gap-2 text-center text-xs font-medium text-gray-500">
        <div>Stunde</div>
        <div>Minute</div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div 
          ref={hourListRef}
          className="h-[200px] overflow-y-auto bg-gray-50 rounded-md"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <button
              key={i}
              data-hour={i}
              onClick={() => handleHourChange(i)}
              className={`w-full py-1.5 text-sm ${
                selectedHour === i 
                  ? "bg-primary text-white" 
                  : "hover:bg-gray-200"
              }`}
            >
              {i.toString().padStart(2, '0')}
            </button>
          ))}
        </div>
        
        <div 
          ref={minuteListRef}
          className="h-[200px] overflow-y-auto bg-gray-50 rounded-md"
        >
          {Array.from({ length: 60 }, (_, i) => (
            <button
              key={i}
              data-minute={i}
              onClick={() => handleMinuteChange(i)}
              className={`w-full py-1.5 text-sm ${
                selectedMinute === i 
                  ? "bg-primary text-white" 
                  : "hover:bg-gray-200"
              }`}
            >
              {i.toString().padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimePickerContent;
