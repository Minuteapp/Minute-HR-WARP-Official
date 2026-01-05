import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useRecoverySickLeave } from '@/hooks/sick-leave/useRecoverySickLeave';
import { SickLeave } from '@/types/sick-leave';

interface RecoveryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeSickLeave: SickLeave;
}

export const RecoveryDialog = ({ isOpen, onOpenChange, activeSickLeave }: RecoveryDialogProps) => {
  const { reportRecovery, isReporting } = useRecoverySickLeave();
  
  const [recoveryDate, setRecoveryDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');

  const currentEndDate = activeSickLeave.end_date ? new Date(activeSickLeave.end_date) : new Date();

  const handleSubmit = async () => {
    if (!recoveryDate) {
      return;
    }

    const success = await reportRecovery(activeSickLeave.id, recoveryDate, notes);
    
    if (success) {
      onOpenChange(false);
      setRecoveryDate(undefined);
      setNotes('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Genesung melden</DialogTitle>
              <DialogDescription>
                Teilen Sie uns mit, wann Sie wieder arbeitsfähig sind.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Aktuelle Krankmeldung bis Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Aktuelle Krankmeldung bis:</span>
            <span className="font-semibold text-primary">
              {format(currentEndDate, 'dd.MM.yyyy', { locale: de })}
            </span>
          </div>

          {/* Arbeitsfähig ab Datepicker */}
          <div className="space-y-2">
            <Label>Arbeitsfähig ab *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {recoveryDate ? format(recoveryDate, 'PPP', { locale: de }) : 'Datum wählen'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={recoveryDate}
                  onSelect={setRecoveryDate}
                  disabled={(date) => date > currentEndDate}
                  locale={de}
                  weekStartsOn={1}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Wählen Sie den Tag, an dem Sie wieder zur Arbeit kommen werden.
            </p>
          </div>

          {/* Anmerkungen (optional) Textarea */}
          <div className="space-y-2">
            <Label>Anmerkungen (optional)</Label>
            <Textarea
              placeholder="Zusätzliche Informationen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Grüne Info-Box */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-900">
              Ihre Genesung wird automatisch an Ihren Vorgesetzten und die Personalabteilung gemeldet. Ihre Krankmeldung wird entsprechend aktualisiert.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isReporting}>
            Abbrechen
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white" 
            onClick={handleSubmit}
            disabled={isReporting || !recoveryDate}
          >
            {isReporting ? 'Wird gemeldet...' : 'Genesung melden'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
