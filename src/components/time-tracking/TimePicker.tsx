import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface TimePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  title?: string;
}

const TimePicker = ({ open, onOpenChange, selectedTime, onTimeSelect, title = "Schnellauswahl" }: TimePickerProps) => {
  const quickTimes = ["08:00", "09:00", "12:00", "13:00", "16:00", "17:00"];
  
  const [hours, setHours] = useState("08");
  const [minutes, setMinutes] = useState("00");

  useEffect(() => {
    if (selectedTime) {
      const [h, m] = selectedTime.split(":");
      setHours(h);
      setMinutes(m);
    }
  }, [selectedTime]);

  const handleQuickSelect = (time: string) => {
    const [h, m] = time.split(":");
    setHours(h);
    setMinutes(m);
  };

  const handleConfirm = () => {
    onTimeSelect(`${hours}:${minutes}`);
    onOpenChange(false);
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-[90vw] bg-white">
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          
          {/* Schnellauswahl Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {quickTimes.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleQuickSelect(time)}
                className={`py-3 px-4 rounded-lg border-2 transition-all ${
                  `${hours}:${minutes}` === time
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>

          {/* Individuelle Zeit */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Individuelle Zeit</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-2 text-center">Stunden</label>
                <div className="h-32 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
                  {hourOptions.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHours(h)}
                      className={`w-full py-2 text-center transition-colors ${
                        hours === h
                          ? 'bg-blue-500 text-white font-medium'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-2xl font-bold text-gray-400">:</div>
              
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-2 text-center">Minuten</label>
                <div className="h-32 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
                  {minuteOptions.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMinutes(m)}
                      className={`w-full py-2 text-center transition-colors ${
                        minutes === m
                          ? 'bg-blue-500 text-white font-medium'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ausgewählte Zeit */}
          <div className="text-center">
            <span className="text-sm text-gray-600 mr-2">Ausgewählte Zeit:</span>
            <span className="text-3xl font-bold text-blue-600">{hours}:{minutes}</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Übernehmen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimePicker;
