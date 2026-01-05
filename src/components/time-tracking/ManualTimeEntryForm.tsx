import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Clock, Calendar as CalendarIcon, Info, MapPin, Briefcase, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import TimePicker from "./TimePicker";
import BreakEntry, { Break } from "./BreakEntry";
import ProjectSelector from "./ProjectSelector";
import LocationSelector from "./LocationSelector";
import type { ManualTimeEntryData } from "@/services/timeTrackingService";

interface ManualTimeEntryFormProps {
  formData: any;
  setFormData: (data: any | ((prev: any) => any)) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  selectedOfficeName?: string;
  setSelectedOfficeName: (name?: string) => void;
}

const ManualTimeEntryForm = ({
  formData,
  setFormData,
  handleSubmit,
  onClose,
  selectedOfficeName,
  setSelectedOfficeName
}: ManualTimeEntryFormProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Synchronisiere lokale States mit formData für Submit
  useEffect(() => {
    if (date && startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const startDateTime = new Date(date);
      startDateTime.setHours(startH, startM, 0, 0);
      
      const [endH, endM] = endTime.split(':').map(Number);
      const endDateTime = new Date(date);
      endDateTime.setHours(endH, endM, 0, 0);
      
      // Berechne Pausenzeit in Minuten
      const totalBreakMinutes = breaks.reduce((total, breakItem) => {
        const [fromH, fromM] = breakItem.from.split(':').map(Number);
        const [toH, toM] = breakItem.to.split(':').map(Number);
        return total + ((toH * 60 + toM) - (fromH * 60 + fromM));
      }, 0);
      
      setFormData((prev: any) => ({
        ...prev,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        break_duration: totalBreakMinutes
      }));
    }
  }, [date, startTime, endTime, breaks, setFormData]);

  const addBreak = () => {
    const newBreak: Break = {
      id: Date.now().toString(),
      from: "12:00",
      to: "12:30",
      type: "lunch"
    };
    setBreaks([...breaks, newBreak]);
  };

  const updateBreak = (id: string, field: 'from' | 'to' | 'type', value: string) => {
    setBreaks(breaks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const deleteBreak = (id: string) => {
    setBreaks(breaks.filter(b => b.id !== id));
  };

  const calculateDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const duration = endMinutes - startMinutes;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')} h`;
  };

  const calculateBreakTime = () => {
    const totalBreakMinutes = breaks.reduce((total, breakItem) => {
      const [fromH, fromM] = breakItem.from.split(':').map(Number);
      const [toH, toM] = breakItem.to.split(':').map(Number);
      const fromMinutes = fromH * 60 + fromM;
      const toMinutes = toH * 60 + toM;
      return total + (toMinutes - fromMinutes);
    }, 0);
    const hours = Math.floor(totalBreakMinutes / 60);
    const minutes = totalBreakMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')} h`;
  };

  const calculateWorkTime = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const totalMinutes = endMinutes - startMinutes;
    
    const breakMinutes = breaks.reduce((total, breakItem) => {
      const [fromH, fromM] = breakItem.from.split(':').map(Number);
      const [toH, toM] = breakItem.to.split(':').map(Number);
      const fromMinutes = fromH * 60 + fromM;
      const toMinutes = toH * 60 + toM;
      return total + (toMinutes - fromMinutes);
    }, 0);
    
    const workMinutes = totalMinutes - breakMinutes;
    const hours = Math.floor(workMinutes / 60);
    const minutes = workMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')} h`;
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Blue Header */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 relative flex-shrink-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-blue-100 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="flex flex-col items-center text-white pt-2">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <Clock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Zeit manuell erfassen</h2>
          <p className="text-blue-100 text-sm text-center">
            Erfassen Sie einen Zeiteintrag nachträglich mit allen Details
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900">
              Manuelle Zeiteinträge müssen von Ihrem Vorgesetzten genehmigt werden.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Datum & Zeiten Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Datum & Zeiten</h3>
            </div>

            {/* Datum */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">Datum</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd. MMMM yyyy", { locale: de }) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                    locale={de}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Startzeit */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">Startzeit</label>
              <button
                type="button"
                onClick={() => setShowStartTimePicker(true)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{startTime}</span>
              </button>
            </div>

            {/* Endzeit */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">Endzeit</label>
              <button
                type="button"
                onClick={() => setShowEndTimePicker(true)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{endTime}</span>
              </button>
            </div>

            {/* Pausenzeit & Arbeitszeit */}
            <div className="pt-3 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pausenzeit:</span>
                <span className="font-medium">{calculateBreakTime()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Arbeitszeit:</span>
                <span className="font-bold text-blue-600 text-base">{calculateWorkTime()}</span>
              </div>
            </div>
          </div>

          {/* Zuordnung Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Zuordnung</h3>

            {/* Projekt */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-600" />
                <label className="text-sm font-medium text-gray-900">
                  Projekt / Aktivität
                </label>
                <Badge variant="destructive" className="text-xs">
                  Erforderlich
                </Badge>
              </div>
              <ProjectSelector
                project={formData.project || ''}
                onProjectChange={(value) => setFormData({ ...formData, project: value })}
              />
            </div>

            {/* Arbeitsort */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <label className="text-sm font-medium text-gray-900">
                  Arbeitsort
                </label>
              </div>
              <LocationSelector
                location={formData.location}
                office_location_id={formData.office_location_id}
                onLocationChange={(location, office_location_id) => 
                  setFormData({ ...formData, location, office_location_id })}
                selectedOfficeName={selectedOfficeName}
                onOfficeNameChange={setSelectedOfficeName}
              />
            </div>
          </div>

          {/* Pausen Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Pausen ({breaks.length})</h3>
              </div>
              <button
                type="button"
                onClick={addBreak}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                +
              </button>
            </div>

            {breaks.map((breakItem, index) => (
              <BreakEntry
                key={breakItem.id}
                breakItem={breakItem}
                index={index}
                onUpdate={updateBreak}
                onDelete={deleteBreak}
              />
            ))}
          </div>

          {/* Notizen */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Notizen</label>
            <Textarea
              placeholder="Optionale Notizen zu diesem Zeiteintrag..."
              className="min-h-[80px] resize-none"
              value={formData.note || ''}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              Speichern
            </Button>
          </div>
        </form>
      </div>

      {/* Time Pickers */}
      <TimePicker
        open={showStartTimePicker}
        onOpenChange={setShowStartTimePicker}
        selectedTime={startTime}
        onTimeSelect={setStartTime}
        title="Startzeit"
      />

      <TimePicker
        open={showEndTimePicker}
        onOpenChange={setShowEndTimePicker}
        selectedTime={endTime}
        onTimeSelect={setEndTime}
        title="Endzeit"
      />
    </div>
  );
};

export default ManualTimeEntryForm;
