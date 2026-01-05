import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Clock, MapPin, Users, Repeat, Video, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";
import { useCurrentUser } from "@/integrations/supabase/hooks/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewAppointmentDialog({ open, onOpenChange }: NewAppointmentDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { tenantCompany, isSuperAdmin } = useTenant();
  const { data: currentUser } = useCurrentUser();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [isTeamsMeeting, setIsTeamsMeeting] = useState(false);
  const [recurrence, setRecurrence] = useState("none");
  const [attendees, setAttendees] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [sendInvites, setSendInvites] = useState(true);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const parseAttendees = (attendeesString: string): string[] => {
    return attendeesString
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'));
  };

  const sendCalendarInvites = async (
    eventTitle: string,
    eventDate: Date,
    eventStartTime: string,
    eventEndTime: string,
    eventLocation: string,
    eventDescription: string,
    attendeeEmails: string[],
    isAllDayEvent: boolean
  ) => {
    if (attendeeEmails.length === 0) return;

    try {
      console.log('[Calendar] Sending invites to:', attendeeEmails);
      
      const { data, error } = await supabase.functions.invoke('send-calendar-invite', {
        body: {
          title: eventTitle,
          date: eventDate.toISOString(),
          startTime: eventStartTime,
          endTime: eventEndTime,
          location: eventLocation,
          description: eventDescription,
          attendees: attendeeEmails,
          isAllDay: isAllDayEvent,
        }
      });

      if (error) {
        console.error('[Calendar] Error sending invites:', error);
        toast({
          variant: "destructive",
          title: "E-Mail-Versand fehlgeschlagen",
          description: "Die Einladungen konnten nicht gesendet werden.",
        });
        return;
      }

      console.log('[Calendar] Invites sent successfully:', data);
      toast({
        title: "Einladungen gesendet",
        description: `${attendeeEmails.length} Einladung(en) wurden verschickt.`,
      });
    } catch (err) {
      console.error('[Calendar] Exception sending invites:', err);
    }
  };

  const handleSave = async () => {
    console.log('[Calendar] Starting save with data:', {
      title, date, startTime, endTime, location, description, isAllDay, attendees
    });

    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte geben Sie einen Titel ein.",
      });
      return;
    }

    // SuperAdmin muss im Tenant-Modus sein
    if (isSuperAdmin && !tenantCompany) {
      toast({
        variant: "destructive",
        title: "Tenant-Modus erforderlich",
        description: "Als SuperAdmin müssen Sie in den Tenant-Modus wechseln, um Termine zu erstellen.",
      });
      return;
    }

    // Normale Benutzer benötigen company_id aus user_roles
    let companyId = tenantCompany?.id;
    
    if (!companyId && currentUser?.company_id) {
      companyId = currentUser.company_id;
    }

    if (!companyId) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Keine Firma zugeordnet. Bitte kontaktieren Sie Ihren Administrator.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Sie müssen angemeldet sein.",
        });
        setIsSaving(false);
        return;
      }

      // Parse attendees
      const attendeesList = parseAttendees(attendees);
      console.log('[Calendar] Parsed attendees:', attendeesList);

      // Create date-time objects
      const startDateTime = new Date(date);
      const [startHour, startMinute] = startTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(date);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      console.log('[Calendar] Saving event:', {
        title,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        is_all_day: isAllDay,
        location,
        description,
        attendees: attendeesList,
        company_id: companyId,
      });

      const { error } = await supabase.from('calendar_events').insert({
        title,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        is_all_day: isAllDay,
        location,
        description,
        type: 'appointment',
        created_by: user.user.id,
        company_id: companyId,
        attendees: attendeesList,
      });

      if (error) {
        console.error('[Calendar] Database error:', error);
        throw error;
      }

      console.log('[Calendar] Event saved successfully');

      // Query Cache invalidieren damit Kalender aktualisiert wird
      queryClient.invalidateQueries({ queryKey: ['my-calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['team-calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['company-calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });

      // Send email invitations if enabled and attendees exist
      if (sendInvites && attendeesList.length > 0) {
        await sendCalendarInvites(
          title,
          date,
          startTime,
          endTime,
          location,
          description,
          attendeesList,
          isAllDay
        );
      }

      toast({
        title: "Termin erstellt",
        description: `"${title}" wurde erfolgreich gespeichert.`,
      });

      onOpenChange(false);
      
      // Reset form
      setTitle("");
      setDate(new Date());
      setStartTime("09:30");
      setEndTime("10:00");
      setLocation("");
      setDescription("");
      setAttendees("");
      setIsAllDay(false);
      setIsTeamsMeeting(false);
      setRecurrence("none");
      setSendInvites(true);
    } catch (error: any) {
      console.error('[Calendar] Error creating appointment:', error);
      toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: error.message || "Termin konnte nicht erstellt werden.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto z-50">
        <DialogHeader>
          <DialogTitle>Neuer Termin</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Titel */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              placeholder="Titel hinzufügen"
              value={title}
              onChange={(e) => {
                console.log('[Calendar] Title changed:', e.target.value);
                setTitle(e.target.value);
              }}
              className="text-lg font-medium"
            />
          </div>

          {/* Erforderliche Personen */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teilnehmer einladen
            </Label>
            <Input
              placeholder="E-Mail-Adressen eingeben (durch Komma getrennt)"
              value={attendees}
              onChange={(e) => {
                console.log('[Calendar] Attendees changed:', e.target.value);
                setAttendees(e.target.value);
              }}
            />
            {attendees && parseAttendees(attendees).length > 0 && (
              <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                <Label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Mail className="h-4 w-4" />
                  E-Mail-Einladungen senden ({parseAttendees(attendees).length} Empfänger)
                </Label>
                <Switch checked={sendInvites} onCheckedChange={setSendInvites} />
              </div>
            )}
          </div>

          {/* Datum und Ganztägig */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Datum *</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 z-[200] pointer-events-auto" 
                  align="start"
                  sideOffset={8}
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      if (newDate) {
                        console.log('[Calendar] Date selected:', newDate);
                        setDate(newDate);
                        setDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Ganztägig</span>
                <Switch 
                  checked={isAllDay} 
                  onCheckedChange={(checked) => {
                    console.log('[Calendar] All day changed:', checked);
                    setIsAllDay(checked);
                  }} 
                />
              </Label>
            </div>
          </div>

          {/* Zeitauswahl */}
          {!isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Von
                </Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    console.log('[Calendar] Start time changed:', e.target.value);
                    setStartTime(e.target.value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Bis</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    console.log('[Calendar] End time changed:', e.target.value);
                    setEndTime(e.target.value);
                  }}
                />
              </div>
            </div>
          )}

          {/* Wiederholung */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Wiederholung
            </Label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger>
                <SelectValue placeholder="Wiederholung wählen" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="none">Wiederholt sich nicht</SelectItem>
                <SelectItem value="daily">Täglich</SelectItem>
                <SelectItem value="weekly">Wöchentlich</SelectItem>
                <SelectItem value="monthly">Monatlich</SelectItem>
                <SelectItem value="yearly">Jährlich</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ort */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ort
            </Label>
            <Input
              placeholder="Ort oder Adresse eingeben"
              value={location}
              onChange={(e) => {
                console.log('[Calendar] Location changed:', e.target.value);
                setLocation(e.target.value);
              }}
            />
          </div>

          {/* Teams-Besprechung */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <Label className="flex items-center gap-2 cursor-pointer">
              <Video className="h-4 w-4" />
              Teams-Besprechung
            </Label>
            <Switch 
              checked={isTeamsMeeting} 
              onCheckedChange={(checked) => {
                setIsTeamsMeeting(checked);
                if (checked) {
                  toast({
                    title: "MS Teams Integration",
                    description: "Die MS Teams Integration ist derzeit in Entwicklung und wird bald verfügbar sein.",
                  });
                }
              }} 
            />
          </div>

          {/* Beschreibung */}
          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Textarea
              placeholder="Details zum Termin hinzufügen..."
              value={description}
              onChange={(e) => {
                console.log('[Calendar] Description changed:', e.target.value);
                setDescription(e.target.value);
              }}
              rows={6}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              "Speichern"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
