import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle } from 'lucide-react';
import { SickLeave } from '@/types/sick-leave';
import { useSickLeaveApproval } from '@/hooks/useSickLeaveApproval';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sickLeave: SickLeave | null;
  action: 'approve' | 'reject';
  onSuccess?: () => void;
}

export const ApprovalDialog = ({ 
  open, 
  onOpenChange, 
  sickLeave, 
  action,
  onSuccess 
}: ApprovalDialogProps) => {
  const [notes, setNotes] = useState('');
  const { approveSickLeave, rejectSickLeave, isApproving, isRejecting } = useSickLeaveApproval();

  const handleSubmit = async () => {
    if (!sickLeave) return;
    
    let success = false;
    
    if (action === 'approve') {
      success = await approveSickLeave(sickLeave.id, notes);
    } else {
      success = await rejectSickLeave(sickLeave.id, notes);
    }

    if (success) {
      setNotes('');
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const isApprove = action === 'approve';
  
  if (!sickLeave) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isApprove ? (
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            )}
            <div>
              <DialogTitle>
                {isApprove ? 'Krankmeldung genehmigen' : 'Krankmeldung ablehnen'}
              </DialogTitle>
              <DialogDescription>
                {sickLeave.employee_name || 'Mitarbeiter'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sick Leave Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Zeitraum:</span>
                <div className="font-medium">
                  {format(parseISO(sickLeave.start_date), 'dd.MM.yyyy', { locale: de })}
                  {' - '}
                  {sickLeave.end_date 
                    ? format(parseISO(sickLeave.end_date), 'dd.MM.yyyy', { locale: de })
                    : 'Offen'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Abteilung:</span>
                <div className="font-medium">{sickLeave.department || 'N/A'}</div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Grund:</span>
                <div className="font-medium">{sickLeave.description || 'Nicht angegeben'}</div>
              </div>
              <div>
                <span className="text-gray-600">Attest:</span>
                <div className="font-medium">
                  {sickLeave.has_contacted_doctor ? '✓ Vorhanden' : '✗ Fehlt'}
                </div>
              </div>
            </div>
          </div>

          {/* Notes/Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              {isApprove ? 'Anmerkungen (optional)' : 'Ablehnungsgrund (erforderlich)'}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isApprove 
                ? 'Optionale Anmerkungen zur Genehmigung...'
                : 'Bitte geben Sie einen Grund für die Ablehnung an...'
              }
              rows={4}
              className="resize-none"
            />
          </div>

          {!isApprove && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <strong>Hinweis:</strong> Der Mitarbeiter wird über die Ablehnung informiert und erhält Ihren Ablehnungsgrund.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isApproving || isRejecting}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isApproving || isRejecting || (!isApprove && !notes.trim())}
            className={isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {isApproving || isRejecting ? 'Wird verarbeitet...' : (
              isApprove ? 'Genehmigen' : 'Ablehnen'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};