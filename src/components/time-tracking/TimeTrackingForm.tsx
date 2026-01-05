
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProjectSelector from "./ProjectSelector";
import LocationSelector from "./LocationSelector";
import MapWithToken from "./MapWithToken";
import BreakManagement, { Break } from "../time/dialogs/BreakManagement";
import TimePickerContent from "@/time-tracking/TimePickerContent";
import type { NewTimeEntry } from "@/services/timeTrackingService";
import { Play, Clock, Building2, Home, Navigation, MapPin, Calendar as CalendarIcon, Info, Coffee, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TimeTrackingFormProps {
  mode: "start" | "end" | "manual";
  formData: NewTimeEntry;
  setFormData: (data: NewTimeEntry) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  onClose?: () => void;
  selectedOfficeName?: string;
  setSelectedOfficeName: (name?: string) => void;
  breaks?: Break[];
  onBreaksChange?: (breaks: Break[]) => void;
  calculateTotalBreakMinutes?: () => number;
  calculateWorkTime?: () => number;
  formatMinutesToTime?: (minutes: number) => string;
}

const TimeTrackingForm = ({
  mode,
  formData,
  setFormData,
  handleSubmit,
  onClose,
  selectedOfficeName,
  setSelectedOfficeName,
  breaks = [],
  onBreaksChange = () => {},
  calculateTotalBreakMinutes = () => 0,
  calculateWorkTime = () => 0,
  formatMinutesToTime = (m) => `${m}m`
}: TimeTrackingFormProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: [number, number] = [position.coords.longitude, position.coords.latitude];
          console.log("User location obtained:", location);
          setUserLocation(location);
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleLocationChange = (location: string, office_location_id?: string) => {
    setFormData({ ...formData, location, office_location_id });
  };

  const formatCoordinates = (coords: [number, number] | null) => {
    if (!coords) return null;
    const [lng, lat] = coords;
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  };

  const getLocationText = () => {
    switch (formData.location) {
      case 'office':
        return selectedOfficeName || 'Hauptgebäude, Alexanderplatz 1, 10178 Berlin';
      case 'home_office':
        return 'Home Office - Ihre Privatadresse';
      case 'remote':
        return 'Mobil - GPS-Standort wird erfasst';
      default:
        return 'Standort auswählen';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
      <div className="py-6 px-6">
        {mode === "start" ? (
          <div className="space-y-5">
            {/* Projekt/Aktivität */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <Label className="text-sm font-medium text-gray-700">Projekt / Aktivität</Label>
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-medium">Erforderlich</span>
              </div>
              <ProjectSelector
                project={formData.project || 'none'}
                onProjectChange={(value) => setFormData({ ...formData, project: value })}
                placeholder="Wählen Sie ein Projekt aus..."
                label=""
              />
            </div>

            {/* Arbeitsort als Karten */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Arbeitsort</Label>
              <div className="grid grid-cols-3 gap-3">
                {/* Büro */}
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    formData.location === 'office' 
                      ? 'border-[#6366F1] bg-white' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => handleLocationChange('office', undefined)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    formData.location === 'office' 
                      ? 'bg-[#6366F1]' 
                      : 'bg-gray-100'
                  }`}>
                    <Building2 className={`h-5 w-5 ${
                      formData.location === 'office' ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    formData.location === 'office' ? 'text-[#6366F1]' : 'text-gray-700'
                  }`}>Büro</span>
                </button>

                {/* Home Office */}
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    formData.location === 'home_office' 
                      ? 'border-[#6366F1] bg-white' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => handleLocationChange('home_office', undefined)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    formData.location === 'home_office' 
                      ? 'bg-[#6366F1]' 
                      : 'bg-gray-100'
                  }`}>
                    <Home className={`h-5 w-5 ${
                      formData.location === 'home_office' ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    formData.location === 'home_office' ? 'text-[#6366F1]' : 'text-gray-700'
                  }`}>Home Office</span>
                </button>

                {/* Unterwegs */}
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    formData.location === 'remote' 
                      ? 'border-[#6366F1] bg-white' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => handleLocationChange('remote', undefined)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    formData.location === 'remote' 
                      ? 'bg-[#6366F1]' 
                      : 'bg-gray-100'
                  }`}>
                    <Navigation className={`h-5 w-5 ${
                      formData.location === 'remote' ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    formData.location === 'remote' ? 'text-[#6366F1]' : 'text-gray-700'
                  }`}>Unterwegs</span>
                </button>
              </div>
            </div>

            {/* Aktueller Standort Container */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <MapPin className="h-4 w-4 text-[#6366F1]" />
                </div>
                <span className="text-sm font-medium text-gray-700">Aktueller Standort</span>
              </div>
              
              <p className="text-sm text-gray-600 pl-10">{getLocationText()}</p>
              
              {formData.location === 'remote' && userLocation && (
                <div className="ml-10 bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <Navigation className="h-3 w-3" />
                    <span>GPS-Koordinaten</span>
                  </div>
                  <p className="text-sm font-mono text-gray-700">{formatCoordinates(userLocation)}</p>
                </div>
              )}

              {/* Karte */}
              <div className="h-[180px] w-full rounded-lg overflow-hidden border border-gray-200">
                <MapWithToken
                  address={selectedOfficeName}
                  initialLocation={userLocation}
                  onLocationUpdate={(coords) => {
                    console.log("Location updated:", coords);
                  }}
                />
              </div>
            </div>

            {/* Notizen */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Notizen (optional)</Label>
              <Textarea
                placeholder="Fügen Sie hier optionale Notizen hinzu..."
                className="min-h-[80px] resize-none border border-gray-200 rounded-lg focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                value={formData.note || ''}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
              <p className="text-xs text-gray-500">Diese Notizen sind nur für Sie sichtbar und helfen bei der späteren Nachverfolgung</p>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={onClose}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-[#A78BFA] to-[#C084FC] hover:from-[#9061F9] hover:to-[#A855F7] text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4" />
                Zeiterfassung starten
              </Button>
            </div>
          </div>
        ) : mode === "manual" ? (
          <ManualTimeEntrySection
            formData={formData}
            setFormData={setFormData}
            selectedOfficeName={selectedOfficeName}
            setSelectedOfficeName={setSelectedOfficeName}
            breaks={breaks}
            onBreaksChange={onBreaksChange}
            calculateTotalBreakMinutes={calculateTotalBreakMinutes}
            calculateWorkTime={calculateWorkTime}
            formatMinutesToTime={formatMinutesToTime}
            userLocation={userLocation}
            onClose={onClose}
            handleLocationChange={handleLocationChange}
          />
        ) : (
          /* Standard-Layout für End */
          <div className="space-y-6">
            <ProjectSelector
              project={formData.project || ''}
              onProjectChange={(value) => setFormData({ ...formData, project: value })}
            />

            <LocationSelector
              location={formData.location}
              office_location_id={formData.office_location_id}
              onLocationChange={handleLocationChange}
              selectedOfficeName={selectedOfficeName}
              onOfficeNameChange={setSelectedOfficeName}
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Standort</Label>
              <div className="h-[200px] rounded-lg overflow-hidden border border-[#3B44F6] shadow-card">
                <MapWithToken
                  address={selectedOfficeName}
                  initialLocation={userLocation}
                  onLocationUpdate={(coords) => {
                    console.log("Location updated:", coords);
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Notizen</Label>
              <Textarea
                value={formData.note || ''}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Optionale Notiz zur Zeiterfassung"
                className="border-[#3B44F6] rounded-lg"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={onClose}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-[#3B44F6] hover:bg-[#3B44F6]/90 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4" />
                Zeiterfassung beenden
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

// Separate Komponente für den manuellen Zeiteintrag
interface ManualTimeEntrySectionProps {
  formData: NewTimeEntry;
  setFormData: (data: NewTimeEntry) => void;
  selectedOfficeName?: string;
  setSelectedOfficeName: (name?: string) => void;
  breaks: Break[];
  onBreaksChange: (breaks: Break[]) => void;
  calculateTotalBreakMinutes: () => number;
  calculateWorkTime: () => number;
  formatMinutesToTime: (minutes: number) => string;
  userLocation: [number, number] | null;
  onClose?: () => void;
  handleLocationChange: (location: string, office_location_id?: string) => void;
}

const ManualTimeEntrySectionComponent = ({
  formData,
  setFormData,
  selectedOfficeName,
  setSelectedOfficeName,
  breaks,
  onBreaksChange,
  calculateTotalBreakMinutes,
  calculateWorkTime,
  formatMinutesToTime,
  userLocation,
  onClose,
  handleLocationChange,
}: ManualTimeEntrySectionProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    try {
      return new Date(formData.start_time);
    } catch {
      return new Date();
    }
  });
  
  const [startTimeValue, setStartTimeValue] = useState(() => {
    try {
      return format(new Date(formData.start_time), 'HH:mm');
    } catch {
      return '09:00';
    }
  });
  
  const [endTimeValue, setEndTimeValue] = useState(() => {
    try {
      return format(new Date(formData.end_time || new Date()), 'HH:mm');
    } catch {
      return '17:00';
    }
  });

  const [openStartTime, setOpenStartTime] = useState(false);
  const [openEndTime, setOpenEndTime] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const updateDateTime = (date: Date, time: string, field: 'start_time' | 'end_time') => {
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    
    if (field === 'start_time') {
      setFormData({ ...formData, start_time: newDate.toISOString() });
    } else {
      setFormData({ ...formData, end_time: newDate.toISOString() });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      updateDateTime(date, startTimeValue, 'start_time');
      updateDateTime(date, endTimeValue, 'end_time');
      setOpenDatePicker(false);
    }
  };

  const handleStartTimeChange = (time: string) => {
    setStartTimeValue(time);
    updateDateTime(selectedDate, time, 'start_time');
  };

  const handleEndTimeChange = (time: string) => {
    setEndTimeValue(time);
    updateDateTime(selectedDate, time, 'end_time');
  };

  return (
    <div className="space-y-6">
      {/* Warnhinweis */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
        <span className="text-sm text-gray-700">Manuelle Zeiteinträge müssen von Ihrem Vorgesetzten genehmigt werden.</span>
      </div>

      {/* 2-Spalten Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Datum & Zeiten Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#6366F1]/10 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-[#6366F1]" />
            </div>
            <h3 className="font-semibold text-gray-800">Datum & Zeiten</h3>
          </div>

          {/* Datum */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Datum</Label>
            <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-gray-200"
                >
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                  {format(selectedDate, 'd. MMMM yyyy', { locale: de })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Zeiten */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Startzeit</Label>
              <Popover open={openStartTime} onOpenChange={setOpenStartTime}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-gray-200"
                  >
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {startTimeValue}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 bg-white z-50" align="start">
                  <TimePickerContent
                    value={startTimeValue}
                    onChange={handleStartTimeChange}
                    onClose={() => setOpenStartTime(false)}
                    hourStep={1}
                    minuteStep={5}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Endzeit</Label>
              <Popover open={openEndTime} onOpenChange={setOpenEndTime}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-gray-200"
                  >
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {endTimeValue}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 bg-white z-50" align="start">
                  <TimePickerContent
                    value={endTimeValue}
                    onChange={handleEndTimeChange}
                    onClose={() => setOpenEndTime(false)}
                    hourStep={1}
                    minuteStep={5}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Berechnungen */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Pausenzeit</span>
              <span className="font-medium text-gray-800">{formatMinutesToTime(calculateTotalBreakMinutes())}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Arbeitszeit</span>
              <span className="text-xl font-bold text-[#6366F1]">{formatMinutesToTime(calculateWorkTime())}</span>
            </div>
          </div>
        </div>

        {/* Pausen Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Coffee className="h-4 w-4 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Pausen ({breaks.length})</h3>
          </div>
          <BreakManagement
            breaks={breaks}
            onBreaksChange={onBreaksChange}
          />
        </div>
      </div>

      {/* Zuordnung Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#6366F1]/10 rounded-full flex items-center justify-center">
            <Building2 className="h-4 w-4 text-[#6366F1]" />
          </div>
          <h3 className="font-semibold text-gray-800">Zuordnung</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Projekt */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">Projekt / Aktivität</Label>
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-medium">Erforderlich</span>
            </div>
            <ProjectSelector
              project={formData.project || 'none'}
              onProjectChange={(value) => setFormData({ ...formData, project: value })}
              placeholder="Wählen Sie ein Projekt aus..."
              label=""
            />
          </div>

          {/* Arbeitsort */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Arbeitsort</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => handleLocationChange(value, undefined)}
            >
              <SelectTrigger className="border-gray-200">
                <SelectValue placeholder="Arbeitsort wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Büro
                  </div>
                </SelectItem>
                <SelectItem value="home_office">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Home Office
                  </div>
                </SelectItem>
                <SelectItem value="remote">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Unterwegs
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notizen Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-gray-800">Notizen</h3>
        <Textarea
          value={formData.note || ''}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="Optionale Notizen zu diesem Zeiteintrag..."
          className="min-h-[80px] resize-none border-gray-200 rounded-lg"
        />
        <p className="text-xs text-gray-500">Diese Notizen sind nur für Sie und Ihren Vorgesetzten sichtbar</p>
      </div>

      {/* Footer Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
          onClick={onClose}
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 bg-gradient-to-r from-[#A78BFA] to-[#C084FC] hover:from-[#9061F9] hover:to-[#A855F7] text-white rounded-lg flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          Zeiteintrag speichern
        </Button>
      </div>
    </div>
  );
};

const ManualTimeEntrySection = ManualTimeEntrySectionComponent;

export default TimeTrackingForm;
