import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Video,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { format, addHours, addMinutes } from 'date-fns';
import { de } from 'date-fns/locale';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService } from '@/services/calendarService';
import { useToast } from '@/hooks/use-toast';

interface QuickEventFormProps {
  template: string;
  onClose: () => void;
}

export const QuickEventForm: React.FC<QuickEventFormProps> = ({ template, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: format(new Date(), 'HH:mm'),
    duration: 60,
    location: '',
    meeting_url: '',
    attendees: '',
    priority: 'medium',
    isAllDay: false,
    reminder: 15
  });

  const [conflicts, setConflicts] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Template-spezifische Vorausfüllungen
  React.useEffect(() => {
    const eventTemplate = calendarService.getEventTemplates().find(t => t.id === template);
    if (eventTemplate) {
      setFormData(prev => ({
        ...prev,
        duration: eventTemplate.duration,
        title: eventTemplate.name
      }));
    }

    // Spezielle Aktionen
    if (template === 'instant') {
      setFormData(prev => ({
        ...prev,
        title: 'Sofort-Meeting',
        startTime: format(new Date(), 'HH:mm'),
        duration: 30,
        meeting_url: 'https://meet.google.com/new'
      }));
    } else if (template === 'focus') {
      setFormData(prev => ({
        ...prev,
        title: 'Fokuszeit',
        duration: 120,
        priority: 'high'
      }));
    } else if (template === 'room') {
      setFormData(prev => ({
        ...prev,
        title: 'Raumbuchung',
        location: 'Konferenzraum'
      }));
    }
  }, [template]);

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      // Erst Konfliktprüfung
      const conflictCheck = await calendarService.detectConflicts(eventData);
      if (conflictCheck.length > 0) {
        setConflicts(conflictCheck);
        return null;
      }
      
      return calendarService.createEvent(eventData);
    },
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Termin erstellt",
          description: "Der Termin wurde erfolgreich erstellt.",
        });
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-dashboard-stats'] });
        onClose();
      }
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Der Termin konnte nicht erstellt werden.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(formData.date);
    const [hours, minutes] = formData.startTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    const endDateTime = addMinutes(startDateTime, formData.duration);

    const eventData = {
      title: formData.title,
      description: formData.description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      is_all_day: formData.isAllDay,
      location: formData.location,
      meeting_url: formData.meeting_url,
      priority: formData.priority as any,
      reminder_minutes: [formData.reminder],
      type: template === 'focus' ? 'focus_time' : 'meeting',
      visibility: 'public' as any,
      color: '#3B82F6',
      status: 'confirmed' as any,
      metadata: {
        template_used: template,
        attendees_emails: formData.attendees.split(',').map(email => email.trim()).filter(Boolean)
      }
    };

    createEventMutation.mutate(eventData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setConflicts([]); // Reset conflicts when form changes
  };

  const resolveConflicts = () => {
    // Automatisch 30 Minuten später vorschlagen
    const newStartTime = addMinutes(new Date(`${format(formData.date, 'yyyy-MM-dd')} ${formData.startTime}`), 30);
    setFormData(prev => ({
      ...prev,
      startTime: format(newStartTime, 'HH:mm')
    }));
    setConflicts([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Konflikt-Warnung */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-orange-800">Terminkonflikt erkannt</h4>
              <p className="text-sm text-orange-700 mt-1">
                Es gibt bereits einen Termin zu dieser Zeit. Möchten Sie eine alternative Zeit vorschlagen lassen?
              </p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={resolveConflicts}
              >
                Alternative Zeit vorschlagen
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Titel */}
        <div className="md:col-span-2">
          <Label htmlFor="title">Titel *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Termin-Titel eingeben..."
            required
          />
        </div>

        {/* Datum */}
        <div>
          <Label>Datum *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(formData.date, 'dd.MM.yyyy', { locale: de })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => date && handleChange('date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Startzeit */}
        <div>
          <Label htmlFor="startTime">Startzeit *</Label>
          <div className="flex gap-2">
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              required
            />
            <Select value={formData.duration.toString()} onValueChange={(value) => handleChange('duration', parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 Min</SelectItem>
                <SelectItem value="30">30 Min</SelectItem>
                <SelectItem value="45">45 Min</SelectItem>
                <SelectItem value="60">1 Std</SelectItem>
                <SelectItem value="90">1,5 Std</SelectItem>
                <SelectItem value="120">2 Std</SelectItem>
                <SelectItem value="180">3 Std</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ort */}
        <div>
          <Label htmlFor="location">Ort</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Konferenzraum, Adresse..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Meeting-Link */}
        <div>
          <Label htmlFor="meeting_url">Meeting-Link</Label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="meeting_url"
              value={formData.meeting_url}
              onChange={(e) => handleChange('meeting_url', e.target.value)}
              placeholder="https://meet.google.com/..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Priorität */}
        <div>
          <Label>Priorität</Label>
          <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Niedrig</SelectItem>
              <SelectItem value="medium">Mittel</SelectItem>
              <SelectItem value="high">Hoch</SelectItem>
              <SelectItem value="urgent">Dringend</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Erinnerung */}
        <div>
          <Label>Erinnerung</Label>
          <Select value={formData.reminder.toString()} onValueChange={(value) => handleChange('reminder', parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 Minuten</SelectItem>
              <SelectItem value="15">15 Minuten</SelectItem>
              <SelectItem value="30">30 Minuten</SelectItem>
              <SelectItem value="60">1 Stunde</SelectItem>
              <SelectItem value="1440">1 Tag</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Teilnehmer */}
        <div className="md:col-span-2">
          <Label htmlFor="attendees">Teilnehmer (E-Mail-Adressen, getrennt durch Komma)</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="attendees"
              value={formData.attendees}
              onChange={(e) => handleChange('attendees', e.target.value)}
              placeholder="user@example.com, team@company.com"
              className="pl-10"
            />
          </div>
        </div>

        {/* Beschreibung */}
        <div className="md:col-span-2">
          <Label htmlFor="description">Beschreibung</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Agenda, Notizen, wichtige Details..."
            rows={3}
          />
        </div>

        {/* Ganztägig */}
        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="all-day"
              checked={formData.isAllDay}
              onCheckedChange={(checked) => handleChange('isAllDay', checked)}
            />
            <Label htmlFor="all-day">Ganztägiger Termin</Label>
          </div>
        </div>
      </div>

      {/* Template Badge */}
      {template && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Vorlage:</span>
          <Badge variant="secondary">
            {calendarService.getEventTemplates().find(t => t.id === template)?.name || template}
          </Badge>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button 
          type="submit" 
          disabled={createEventMutation.isPending || !formData.title}
          className="flex items-center gap-2"
        >
          {createEventMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          Termin erstellen
        </Button>
      </div>
    </form>
  );
};