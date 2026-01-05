import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Clock, Upload, X, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSickLeaveExtension } from '@/hooks/useSickLeaveExtension';
import { SickLeave } from '@/types/sick-leave';

interface ExtensionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sickLeave: SickLeave;
  onSuccess?: () => void;
}

export const ExtensionDialog = ({ open, onOpenChange, sickLeave, onSuccess }: ExtensionDialogProps) => {
  const [newEndDate, setNewEndDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const { submitExtension, isSubmitting } = useSickLeaveExtension();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`Datei ${file.name} ist zu groß (max. 10 MB)`);
          return false;
        }
        return true;
      });
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!newEndDate || files.length === 0) return;

    const result = await submitExtension(sickLeave.id, newEndDate, reason, files);
    
    if (result.success) {
      setNewEndDate(undefined);
      setReason('');
      setFiles([]);
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Clock className="w-6 h-6 text-orange-600" />
            Krankmeldung verlängern
          </DialogTitle>
          <DialogDescription>
            Reichen Sie eine Verlängerung Ihrer Krankmeldung ein.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Sick Leave Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">
              Aktuelle Krankmeldung bis: {format(new Date(sickLeave.end_date || sickLeave.start_date), 'dd.MM.yyyy', { locale: de })}
            </p>
          </div>

          {/* New End Date */}
          <div className="space-y-2">
            <Label>Neues Enddatum *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newEndDate ? format(newEndDate, "PPP", { locale: de }) : "Datum wählen"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newEndDate}
                  onSelect={setNewEndDate}
                  initialFocus
                  locale={de}
                  weekStartsOn={1}
                  disabled={(date) => date <= new Date(sickLeave.end_date || sickLeave.start_date)}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500">
              Das neue Enddatum muss nach dem aktuellen Enddatum liegen.
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-900">
              Für eine Verlängerung ist immer ein aktualisiertes ärztliches Attest erforderlich.
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Grund der Verlängerung (optional)</Label>
            <Textarea
              placeholder="z.B. Komplikationen, ärztliche Empfehlung zur weiteren Schonung..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Ärztliches Attest *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="extension-file-upload"
                className="hidden"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              <label htmlFor="extension-file-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Datei auswählen oder hierher ziehen
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG oder PNG • Max. 10 MB
                </p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 mt-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900">
              Ihre Verlängerung wird automatisch an Ihren Vorgesetzten und die Personalabteilung weitergeleitet und muss genehmigt werden.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!newEndDate || files.length === 0 || isSubmitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? 'Wird eingereicht...' : 'Verlängerung einreichen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
