import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useSickLeaveSubmission } from '@/hooks/useSickLeaveSubmission';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface NewSickLeaveDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewSickLeaveDialog = ({ isOpen, onOpenChange }: NewSickLeaveDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { submitSickLeave, isSubmitting } = useSickLeaveSubmission();
  
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !user?.id) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Bitte füllen Sie alle Pflichtfelder aus.',
      });
      return;
    }

    const result = await submitSickLeave({
      userData: {
        startDate,
        endDate: endDate || startDate,
        reason,
      },
      files,
      userId: user.id,
    });

    if (result) {
      onOpenChange(false);
      setStartDate(undefined);
      setEndDate(undefined);
      setReason('');
      setFiles([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Neue Krankmeldung einreichen
          </DialogTitle>
          <DialogDescription>
            Bitte füllen Sie die folgenden Informationen aus, um Ihre Krankmeldung einzureichen.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Von/Bis Datepicker */}
          <div className="grid grid-cols-2 gap-4">
            {/* Von Datepicker */}
            <div className="space-y-2">
              <Label>Von *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP', { locale: de }) : 'Datum wählen'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={de}
                    weekStartsOn={1}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Bis Datepicker */}
            <div className="space-y-2">
              <Label>Bis *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP', { locale: de }) : 'Datum wählen'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => startDate ? date < startDate : false}
                    locale={de}
                    weekStartsOn={1}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Grund (optional) - Textarea */}
          <div className="space-y-2">
            <Label>Grund (optional)</Label>
            <Textarea
              placeholder="z.B. Grippe, Migräne, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Ärztliches Attest - Drag & Drop Upload */}
          <div className="space-y-2">
            <Label>Ärztliches Attest</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-primary font-medium hover:underline">
                      Datei auswählen
                    </span>
                    <span className="text-muted-foreground"> oder hierher ziehen</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDF, JPG oder PNG • Max. 10 MB
                  </p>
                  {files.length > 0 && (
                    <p className="text-sm text-primary font-medium">
                      {files.length} Datei(en) ausgewählt
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Info-Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Ihre Krankmeldung wird automatisch an Ihren Vorgesetzten und die Personalabteilung weitergeleitet.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Wird eingereicht...' : 'Krankmeldung einreichen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
