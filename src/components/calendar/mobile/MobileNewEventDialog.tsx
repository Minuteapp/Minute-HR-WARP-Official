
import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { X, Clock, Repeat, Users, MapPin, Bell, AlignLeft } from "lucide-react";
import { format } from "date-fns";
import { de } from 'date-fns/locale';
import { NewEvent } from "@/types/calendar";

interface MobileNewEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newEvent: NewEvent;
  onNewEventChange: (event: NewEvent) => void;
  onSave: () => Promise<boolean>;
}

const MobileNewEventDialog = ({
  isOpen,
  onClose,
  newEvent,
  onNewEventChange,
  onSave
}: MobileNewEventDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date(newEvent.start));
  const [endDate, setEndDate] = useState<Date>(new Date(newEvent.end));
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    const success = await onSave();
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  const handleValueChange = (key: keyof NewEvent, value: any) => {
    onNewEventChange({ ...newEvent, [key]: value });
  };

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    handleValueChange('start', date.toISOString());
    setShowStartCalendar(false);
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
    handleValueChange('end', date.toISOString());
    setShowEndCalendar(false);
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: de });
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd. MMMM yyyy', { locale: de });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto h-full max-h-screen overflow-y-auto p-0 bg-white rounded-t-3xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Neuen Termin hinzufügen</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Titel */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-500">Titel</Label>
            <Input
              value={newEvent.title}
              onChange={(e) => handleValueChange('title', e.target.value)}
              placeholder="Design Critique Weekly"
              className="text-lg font-medium border-0 p-0 h-auto bg-transparent focus-visible:ring-0"
            />
          </div>

          {/* Datum und Zeit */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-600" />
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto justify-start text-left">
                        <div>
                          <div className="text-sm font-medium">{formatDate(startDate)}</div>
                          <div className="text-sm text-gray-500">{formatTime(startDate)}</div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && handleStartDateChange(date)}
                        locale={de}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto justify-start text-left">
                        <div>
                          <div className="text-sm font-medium">{formatDate(endDate)}</div>
                          <div className="text-sm text-gray-500">{formatTime(endDate)}</div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && handleEndDateChange(date)}
                        locale={de}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Ganztägig */}
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-900">Ganztägig</span>
              <Switch
                checked={newEvent.isAllDay || false}
                onCheckedChange={(checked) => handleValueChange('isAllDay', checked)}
              />
            </div>
          </div>

          {/* Wiederholung */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Repeat className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900">Wiederholen</span>
            </div>
            <Select defaultValue="never">
              <SelectTrigger className="w-24 border-0 bg-transparent">
                <SelectValue placeholder="Nie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Nie</SelectItem>
                <SelectItem value="daily">Täglich</SelectItem>
                <SelectItem value="weekly">Wöchentlich</SelectItem>
                <SelectItem value="monthly">Monatlich</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Online Event */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 rounded border border-gray-400 flex items-center justify-center">
                <div className="h-2 w-2 rounded bg-gray-400"></div>
              </div>
              <span className="text-gray-900">Online Event</span>
            </div>
            <Switch />
          </div>

          {/* Gäste */}
          <div className="flex items-center space-x-3 py-2">
            <Users className="h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <span className="text-gray-900">Gäste</span>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs"
                    >
                      {i}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs">
                    +
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Standort */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900">Standort</span>
            </div>
            <Input
              value={newEvent.address || ''}
              onChange={(e) => handleValueChange('address', e.target.value)}
              placeholder="Standort hinzufügen"
              className="ml-8"
            />
            {newEvent.address && (
              <div className="ml-8 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Karte</span>
              </div>
            )}
          </div>

          {/* Erinnerungen */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900">Erinnerungen</span>
            </div>
            <Select defaultValue="1hour">
              <SelectTrigger className="w-32 border-0 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1hour">1 Stunde vorher</SelectItem>
                <SelectItem value="30min">30 Min vorher</SelectItem>
                <SelectItem value="15min">15 Min vorher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Beschreibung */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlignLeft className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900">Beschreibung</span>
              </div>
              <X className="h-4 w-4 text-gray-400" />
            </div>
            <Textarea
              value={newEvent.description || ''}
              onChange={(e) => handleValueChange('description', e.target.value)}
              placeholder="Teilnehmer kommen zusammen, um innovative Ideen und Lösungen für ein Projekt zu generieren."
              className="ml-8 border-0 bg-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Speichern Button */}
          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={isSubmitting || !newEvent.title}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl"
            >
              {isSubmitting ? 'Speichern...' : 'Termin speichern'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileNewEventDialog;
