import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarIcon, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSickLeaveRecovery } from '@/hooks/useSickLeaveRecovery';
import { SickLeave } from '@/types/sick-leave';

interface RecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sickLeave: SickLeave;
  onSuccess?: () => void;
}

export const RecoveryDialog = ({ open, onOpenChange, sickLeave, onSuccess }: RecoveryDialogProps) => {
  const [recoveryDate, setRecoveryDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const { reportRecovery, isSubmitting } = useSickLeaveRecovery();

  const handleSubmit = async () => {
    if (!recoveryDate) return;

    const result = await reportRecovery(sickLeave.id, recoveryDate, notes);
    
    if (result.success) {
      setRecoveryDate(undefined);
      setNotes('');
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Genesung melden
          </DialogTitle>
          <DialogDescription>
            Teilen Sie uns mit, wann Sie wieder arbeitsfähig sind.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Sick Leave Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">
              Aktuelle Krankmeldung bis: {format(new Date(sickLeave.end_date || sickLeave.start_date), 'dd.MM.yyyy', { locale: de })}
            </p>
          </div>

          {/* Recovery Date */}
          <div className="space-y-2">
            <Label>Arbeitsfähig ab *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !recoveryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {recoveryDate ? format(recoveryDate, "PPP", { locale: de }) : "Datum wählen"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={recoveryDate}
                  onSelect={setRecoveryDate}
                  initialFocus
                  locale={de}
                  weekStartsOn={1}
                  disabled={(date) => date > new Date(sickLeave.end_date || sickLeave.start_date)}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500">
              Wählen Sie den Tag, an dem Sie wieder arbeitsfähig sind.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Anmerkungen (optional)</Label>
            <Textarea
              placeholder="Zusätzliche Informationen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Success Info Box */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-900">
              Ihre Genesung wird automatisch an Ihren Vorgesetzten und die Personalabteilung gemeldet. Ihre Krankmeldung wird entsprechend aktualisiert.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!recoveryDate || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Wird gemeldet...' : 'Genesung melden'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
