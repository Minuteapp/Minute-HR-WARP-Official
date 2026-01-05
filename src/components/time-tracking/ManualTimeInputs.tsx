
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import TimePickerContent from "./TimePickerContent";
import { useState, useEffect } from "react";

interface ManualTimeInputsProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

const ManualTimeInputs = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: ManualTimeInputsProps) => {
  const [localStartDate, setLocalStartDate] = useState(formatDateForInput(startTime));
  const [localStartTime, setLocalStartTime] = useState(getTimeFromDate(startTime));
  const [localEndDate, setLocalEndDate] = useState(formatDateForInput(endTime));
  const [localEndTime, setLocalEndTime] = useState(getTimeFromDate(endTime));

  useEffect(() => {
    // Aktualisiere die lokalen Zustandsvariablen, wenn sich die Props ändern
    setLocalStartDate(formatDateForInput(startTime));
    setLocalStartTime(getTimeFromDate(startTime));
    setLocalEndDate(formatDateForInput(endTime));
    setLocalEndTime(getTimeFromDate(endTime));
  }, [startTime, endTime]);

  // Formatierungsfunktionen
  function formatDateForInput(dateString: string): string {
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch {
      return format(new Date(), "yyyy-MM-dd");
    }
  }

  function getTimeFromDate(dateString: string): string {
    try {
      return format(new Date(dateString), "HH:mm");
    } catch {
      return "00:00";
    }
  }

  function combineDateTime(date: string, time: string): string {
    try {
      const [hours, minutes] = time.split(':');
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0); // Sekunden und Millisekunden auf 0 setzen
      return newDate.toISOString();
    } catch (error) {
      console.error("Fehler beim Kombinieren von Datum und Zeit:", error);
      return new Date().toISOString(); // Fallback auf aktuelles Datum/Zeit
    }
  }

  // Handler für Änderungen am Startdatum
  const handleStartDateChange = (date: string) => {
    setLocalStartDate(date);
    onStartTimeChange(combineDateTime(date, localStartTime));
  };

  // Handler für Änderungen an der Startzeit
  const handleStartTimeChange = (time: string) => {
    setLocalStartTime(time);
    onStartTimeChange(combineDateTime(localStartDate, time));
  };

  // Handler für Änderungen am Enddatum
  const handleEndDateChange = (date: string) => {
    setLocalEndDate(date);
    onEndTimeChange(combineDateTime(date, localEndTime));
  };

  // Handler für Änderungen an der Endzeit
  const handleEndTimeChange = (time: string) => {
    setLocalEndTime(time);
    onEndTimeChange(combineDateTime(localEndDate, time));
  };

  return (
    <>
      <div className="grid gap-2">
        <Label className="text-sm font-medium">Startzeit</Label>
        <div className="flex gap-2">
          <Input
            type="date"
            value={localStartDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="flex-1"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-[120px] flex justify-between items-center"
              >
                <Clock className="h-4 w-4 mr-2" />
                {localStartTime}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 bg-white z-50 border border-gray-200 shadow-lg rounded-md">
              <TimePickerContent 
                value={localStartTime}
                onChange={handleStartTimeChange}
                hourStep={1}
                minuteStep={5}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-medium">Endzeit</Label>
        <div className="flex gap-2">
          <Input
            type="date"
            value={localEndDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="flex-1"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-[120px] flex justify-between items-center"
              >
                <Clock className="h-4 w-4 mr-2" />
                {localEndTime}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 bg-white z-50 border border-gray-200 shadow-lg rounded-md">
              <TimePickerContent 
                value={localEndTime}
                onChange={handleEndTimeChange}
                hourStep={1}
                minuteStep={5}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
};

export default ManualTimeInputs;
