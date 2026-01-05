import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock, Upload, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useExtendSickLeave } from '@/hooks/sick-leave/useExtendSickLeave';
import { SickLeave } from '@/types/sick-leave';

interface ExtensionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeSickLeave: SickLeave;
}

export const ExtensionDialog = ({ isOpen, onOpenChange, activeSickLeave }: ExtensionDialogProps) => {
  const { extendSickLeave, isExtending } = useExtendSickLeave();
  
  const [newEndDate, setNewEndDate] = useState<Date | undefined>();
  const [extensionReason, setExtensionReason] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const currentEndDate = activeSickLeave.end_date ? new Date(activeSickLeave.end_date) : new Date();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!newEndDate || files.length === 0) {
      return;
    }

    const success = await extendSickLeave(activeSickLeave.id, newEndDate, extensionReason, files);
    
    if (success) {
      onOpenChange(false);
      setNewEndDate(undefined);
      setExtensionReason('');
      setFiles([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Krankmeldung verlängern</DialogTitle>
              <DialogDescription>
                Reichen Sie eine Verlängerung Ihrer Krankmeldung ein.
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

          {/* Neues Enddatum Datepicker */}
          <div className="space-y-2">
            <Label>Neues Enddatum *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newEndDate ? format(newEndDate, 'PPP', { locale: de }) : 'Datum wählen'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newEndDate}
                  onSelect={setNewEndDate}
                  disabled={(date) => date <= currentEndDate}
                  locale={de}
                  weekStartsOn={1}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Das neue Enddatum muss nach dem aktuellen Enddatum liegen.
            </p>
          </div>

          {/* Gelbe Warning-Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-900">
              Für eine Verlängerung ist immer ein aktualisiertes ärztliches Attest erforderlich.
            </p>
          </div>

          {/* Grund der Verlängerung Textarea */}
          <div className="space-y-2">
            <Label>Grund der Verlängerung (optional)</Label>
            <Textarea
              placeholder="z.B. Komplikationen, ärztliche Empfehlung..."
              value={extensionReason}
              onChange={(e) => setExtensionReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Ärztliches Attest Upload (REQUIRED) */}
          <div className="space-y-2">
            <Label>Ärztliches Attest *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="extension-file-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="extension-file-upload" className="cursor-pointer">
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

          {/* Blaue Info-Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Ihre Verlängerung wird automatisch an Ihren Vorgesetzten und die Personalabteilung weitergeleitet und muss genehmigt werden.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExtending}>
            Abbrechen
          </Button>
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white" 
            onClick={handleSubmit}
            disabled={isExtending || !newEndDate || files.length === 0}
          >
            {isExtending ? 'Wird eingereicht...' : 'Verlängerung einreichen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
