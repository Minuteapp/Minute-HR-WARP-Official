
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ProjectSelector from "@/components/time-tracking/ProjectSelector";

interface AddTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export const AddTimeDialog = ({
  open,
  onOpenChange,
  onSave,
  onStartDateChange,
  onEndDateChange,
}: AddTimeDialogProps) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTimePopoverOpen, setStartTimePopoverOpen] = useState(false);
  const [endTimePopoverOpen, setEndTimePopoverOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState("none"); // Standardwert auf "none" geändert
  const [breakMinutes, setBreakMinutes] = useState("0");
  
  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(startDate);
      newDate.setFullYear(date.getFullYear());
      newDate.setMonth(date.getMonth());
      newDate.setDate(date.getDate());
      setStartDate(newDate);
      onStartDateChange(newDate);
    }
    setStartTimePopoverOpen(false);
  };
  
  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(endDate);
      newDate.setFullYear(date.getFullYear());
      newDate.setMonth(date.getMonth());
      newDate.setDate(date.getDate());
      setEndDate(newDate);
      onEndDateChange(newDate);
    }
    setEndTimePopoverOpen(false);
  };
  
  const handleStartHourChange = (hour: string) => {
    const newDate = new Date(startDate);
    newDate.setHours(parseInt(hour));
    setStartDate(newDate);
    onStartDateChange(newDate);
  };
  
  const handleStartMinuteChange = (minute: string) => {
    const newDate = new Date(startDate);
    newDate.setMinutes(parseInt(minute));
    setStartDate(newDate);
    onStartDateChange(newDate);
  };
  
  const handleEndHourChange = (hour: string) => {
    const newDate = new Date(endDate);
    newDate.setHours(parseInt(hour));
    setEndDate(newDate);
    onEndDateChange(newDate);
  };
  
  const handleEndMinuteChange = (minute: string) => {
    const newDate = new Date(endDate);
    newDate.setMinutes(parseInt(minute));
    setEndDate(newDate);
    onEndDateChange(newDate);
  };
  
  const handleProjectChange = (value: string) => {
    console.log('AddTimeDialog - Project changed to:', value);
    setSelectedProject(value || "none"); // Fallback auf "none" wenn der Wert leer ist
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Zeiterfassung hinzufügen</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Startdatum</Label>
              <Popover open={startTimePopoverOpen} onOpenChange={setStartTimePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                    id="start-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "PPP", { locale: de })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateSelect}
                    initialFocus
                    locale={de}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="end-date">Enddatum</Label>
              <Popover open={endTimePopoverOpen} onOpenChange={setEndTimePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                    id="end-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, "PPP", { locale: de })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateSelect}
                    initialFocus
                    locale={de}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Startzeit</Label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="text-gray-400 w-4 h-4" />
                <Select
                  value={startDate.getHours().toString().padStart(2, '0')}
                  onValueChange={handleStartHourChange}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="HH" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                      <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                        {hour.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>:</span>
                <Select
                  value={startDate.getMinutes().toString().padStart(2, '0')}
                  onValueChange={handleStartMinuteChange}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                      <SelectItem key={minute} value={minute.toString().padStart(2, '0')}>
                        {minute.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="end-time">Endzeit</Label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="text-gray-400 w-4 h-4" />
                <Select
                  value={endDate.getHours().toString().padStart(2, '0')}
                  onValueChange={handleEndHourChange}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="HH" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                      <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                        {hour.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>:</span>
                <Select
                  value={endDate.getMinutes().toString().padStart(2, '0')}
                  onValueChange={handleEndMinuteChange}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                      <SelectItem key={minute} value={minute.toString().padStart(2, '0')}>
                        {minute.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div>
            <ProjectSelector 
              project={selectedProject}
              onProjectChange={handleProjectChange}
            />
          </div>
          
          <div>
            <Label htmlFor="break">Pause (Minuten)</Label>
            <Input 
              id="break"
              type="number" 
              min="0" 
              value={breakMinutes} 
              onChange={(e) => setBreakMinutes(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={onSave} type="submit">
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
