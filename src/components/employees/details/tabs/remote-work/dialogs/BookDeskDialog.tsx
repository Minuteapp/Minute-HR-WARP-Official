import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, MapPin } from 'lucide-react';
import { useBookDesk } from '@/integrations/supabase/hooks/useEmployeeRemoteWork';
import { toast } from 'sonner';

interface BookDeskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  preferredFloor?: string;
  deskBookingId: string;
}

const FLOORS = ['EG', '1. OG', '2. OG', '3. OG', '4. OG'];
const WORKSPACE_TYPES = [
  { value: 'Ruhezone', label: 'Ruhezone' },
  { value: 'Teambereich', label: 'Teambereich' },
  { value: 'Fokusraum', label: 'Fokusraum' },
];
const TIME_SLOTS = [
  { value: 'ganztägig', label: 'Ganztägig (8:00 - 17:00)' },
  { value: 'vormittag', label: 'Vormittag (8:00 - 12:00)' },
  { value: 'nachmittag', label: 'Nachmittag (13:00 - 17:00)' },
];

export const BookDeskDialog = ({ 
  open, 
  onOpenChange, 
  employeeId, 
  preferredFloor,
  deskBookingId 
}: BookDeskDialogProps) => {
  const [bookingDate, setBookingDate] = useState<Date>();
  const [floor, setFloor] = useState<string>(preferredFloor || '');
  const [workspaceType, setWorkspaceType] = useState<string>('Teambereich');
  const [timeSlot, setTimeSlot] = useState<string>('ganztägig');
  const [notes, setNotes] = useState<string>('');
  
  const bookDeskMutation = useBookDesk();
  
  // Simulierte Verfügbarkeit (könnte aus der DB kommen)
  const availableDesks = 12;
  const totalDesks = 45;

  const handleSubmit = async () => {
    if (!bookingDate) {
      toast.error('Bitte wählen Sie ein Datum aus');
      return;
    }

    // Validierung: Nur Werktage
    const day = bookingDate.getDay();
    if (day === 0 || day === 6) {
      toast.error('Buchungen sind nur für Werktage (Mo-Fr) möglich');
      return;
    }

    // Validierung: Nur Zukunft
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      toast.error('Das Buchungsdatum muss in der Zukunft liegen');
      return;
    }

    try {
      await bookDeskMutation.mutateAsync({
        employee_id: employeeId,
        desk_booking_id: deskBookingId,
        booking_date: bookingDate.toISOString().split('T')[0],
        floor: floor || undefined,
        status: 'gebucht',
      });

      toast.success('Arbeitsplatz erfolgreich gebucht!');
      onOpenChange(false);
      
      // Reset form
      setBookingDate(undefined);
      setFloor(preferredFloor || '');
      setWorkspaceType('Teambereich');
      setTimeSlot('ganztägig');
      setNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Buchen des Arbeitsplatzes');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Arbeitsplatz buchen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Datum */}
          <div className="space-y-2">
            <Label htmlFor="booking-date">Buchungsdatum *</Label>
            <DatePicker
              date={bookingDate}
              onChange={setBookingDate}
              placeholder="Datum auswählen"
              minDate={new Date()}
            />
          </div>

          {/* Stockwerk */}
          <div className="space-y-2">
            <Label htmlFor="floor">Stockwerk</Label>
            <Select value={floor} onValueChange={setFloor}>
              <SelectTrigger>
                <SelectValue placeholder="Stockwerk wählen" />
              </SelectTrigger>
              <SelectContent>
                {FLOORS.map((f) => (
                  <SelectItem key={f} value={f}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {f}
                      {f === preferredFloor && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Bevorzugt
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Arbeitsplatz-Typ */}
          <div className="space-y-2">
            <Label>Arbeitsplatz-Typ</Label>
            <RadioGroup value={workspaceType} onValueChange={setWorkspaceType}>
              {WORKSPACE_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label htmlFor={type.value} className="font-normal cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Zeitslot */}
          <div className="space-y-2">
            <Label>Zeitslot</Label>
            <RadioGroup value={timeSlot} onValueChange={setTimeSlot}>
              {TIME_SLOTS.map((slot) => (
                <div key={slot.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={slot.value} id={slot.value} />
                  <Label htmlFor={slot.value} className="font-normal cursor-pointer">
                    {slot.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Notizen */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Besondere Anforderungen..."
              rows={2}
            />
          </div>

          {/* Verfügbarkeit */}
          {bookingDate && (
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Verfügbarkeit:</span>
                <Badge className={availableDesks < 5 ? 'bg-orange-500' : 'bg-green-500'}>
                  {availableDesks} von {totalDesks} Plätzen verfügbar
                </Badge>
              </div>
              {availableDesks < 5 && (
                <div className="flex items-start gap-2 text-xs text-orange-600">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Nur noch wenige Plätze verfügbar! Buchen Sie frühzeitig.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!bookingDate || bookDeskMutation.isPending}
            className="bg-black hover:bg-black/90 text-white"
          >
            {bookDeskMutation.isPending ? 'Wird gebucht...' : 'Jetzt buchen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
