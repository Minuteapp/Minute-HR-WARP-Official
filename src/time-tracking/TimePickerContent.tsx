
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface TimePickerContentProps {
  value: string;
  onChange: (value: string) => void;
  hourStep?: number;
  minuteStep?: number;
  onClose?: () => void;
  showActions?: boolean;
}

const QUICK_TIMES = ['08:00', '09:00', '12:00', '13:00', '16:00', '17:00'];

const TimePickerContent = ({
  value,
  onChange,
  hourStep = 1,
  minuteStep = 5,
  onClose,
  showActions = true,
}: TimePickerContentProps) => {
  const [hours, minutes] = value ? value.split(':').map(Number) : [0, 0];
  const [tempValue, setTempValue] = useState(value);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  
  const [tempHours, tempMinutes] = tempValue ? tempValue.split(':').map(Number) : [0, 0];

  const handleHourChange = (newHour: number) => {
    const validHour = Math.max(0, Math.min(23, newHour));
    const newValue = `${String(validHour).padStart(2, '0')}:${String(tempMinutes).padStart(2, '0')}`;
    setTempValue(newValue);
    if (!showActions) {
      onChange(newValue);
    }
  };

  const handleMinuteChange = (newMinute: number) => {
    const validMinute = Math.max(0, Math.min(59, newMinute));
    const newValue = `${String(tempHours).padStart(2, '0')}:${String(validMinute).padStart(2, '0')}`;
    setTempValue(newValue);
    if (!showActions) {
      onChange(newValue);
    }
  };

  const handleQuickTimeSelect = (time: string) => {
    setTempValue(time);
    if (!showActions) {
      onChange(time);
    }
  };

  const handleConfirm = () => {
    onChange(tempValue);
    onClose?.();
  };

  const handleCancel = () => {
    setTempValue(value);
    onClose?.();
  };

  // Scroll to selected hour and minute when component mounts
  useEffect(() => {
    if (hoursRef.current && minutesRef.current) {
      const hourElement = hoursRef.current.querySelector(`[data-hour="${tempHours}"]`);
      const minuteElement = minutesRef.current.querySelector(`[data-minute="${tempMinutes}"]`);
      
      if (hourElement) {
        hoursRef.current.scrollTop = (hourElement as HTMLElement).offsetTop - hoursRef.current.offsetTop - 40;
      }
      
      if (minuteElement) {
        minutesRef.current.scrollTop = (minuteElement as HTMLElement).offsetTop - minutesRef.current.offsetTop - 40;
      }
    }
  }, [tempHours, tempMinutes]);

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
    <div className="flex flex-col space-y-4 w-[280px]">
      {/* Schnellauswahl */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-500">Schnellauswahl</span>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_TIMES.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => handleQuickTimeSelect(time)}
              className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                tempValue === time
                  ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Zeit-Auswahl */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <div className="text-xs font-medium text-gray-500 mb-2">Std</div>
          <div 
            ref={hoursRef}
            className="h-[160px] overflow-y-auto flex flex-col w-full rounded-lg border border-gray-200 bg-gray-50"
          >
            {hourOptions.map((hour) => (
              <button
                key={hour}
                type="button"
                data-hour={hour}
                onClick={() => handleHourChange(hour)}
                className={`py-2 px-3 text-center text-sm font-medium transition-colors ${
                  hour === tempHours 
                    ? 'bg-[#6366F1] text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {String(hour).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xs font-medium text-gray-500 mb-2">Min</div>
          <div 
            ref={minutesRef}
            className="h-[160px] overflow-y-auto flex flex-col w-full rounded-lg border border-gray-200 bg-gray-50"
          >
            {minuteOptions.map((minute) => (
              <button
                key={minute}
                type="button"
                data-minute={minute}
                onClick={() => handleMinuteChange(minute)}
                className={`py-2 px-3 text-center text-sm font-medium transition-colors ${
                  minute === tempMinutes 
                    ? 'bg-[#6366F1] text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {String(minute).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gewählt Anzeige */}
      <div className="flex items-center justify-center py-3 bg-[#6366F1]/10 rounded-lg">
        <span className="text-xs text-gray-500 mr-2">Gewählt:</span>
        <span className="text-2xl font-bold text-[#6366F1]">{tempValue}</span>
      </div>

      {/* Buttons */}
      {showActions && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-10 border-gray-300 text-gray-700"
            onClick={handleCancel}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            className="flex-1 h-10 bg-[#6366F1] hover:bg-[#5558E3] text-white"
            onClick={handleConfirm}
          >
            Übernehmen
          </Button>
        </div>
      )}
    </div>
  );
};

export default TimePickerContent;
