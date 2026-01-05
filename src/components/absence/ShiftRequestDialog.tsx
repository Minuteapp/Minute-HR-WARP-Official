
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { absenceManagementService } from '@/services/absenceManagementService';
import { useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/contexts/TenantContext';

interface ShiftRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShiftRequestDialog({ open, onOpenChange }: ShiftRequestDialogProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [shift, setShift] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tenantCompany, isSuperAdmin } = useTenant();

  const handleSubmit = async () => {
    if (!date || !shift) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Bitte Datum und Schichttyp angeben'
      });
      return;
    }

    // company_id ermitteln - SuperAdmins können ohne company_id testen
    const effectiveCompanyId = tenantCompany?.id || null;

    setIsSubmitting(true);
    try {
      const result = await absenceManagementService.createRequest({
        type: 'other',
        start_date: format(date, 'yyyy-MM-dd'),
        end_date: format(date, 'yyyy-MM-dd'),
        reason: `Schichtanfrage: ${shift}${reason ? ' - ' + reason : ''}`,
        half_day: false,
        status: 'pending',
        company_id: effectiveCompanyId
      });

      if (result) {
        toast({
          title: 'Erfolg',
          description: 'Schichtanfrage wurde erfolgreich erstellt'
        });
        
        // Reset form
        setDate(undefined);
        setShift('');
        setReason('');
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['absence-requests'] });
        queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
        
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Schichtanfrage:', error);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Schichtanfrage konnte nicht erstellt werden'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schichtanfrage stellen</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Datum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd.MM.yyyy', { locale: de }) : 'Datum wählen'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift">Schichttyp</Label>
            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger>
                <SelectValue placeholder="Schichttyp wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="early">Frühschicht</SelectItem>
                <SelectItem value="late">Spätschicht</SelectItem>
                <SelectItem value="night">Nachtschicht</SelectItem>
                <SelectItem value="extra">Zusatzschicht</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Grund (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Begründung für die Schichtanfrage..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Wird gespeichert...' : 'Anfrage stellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
