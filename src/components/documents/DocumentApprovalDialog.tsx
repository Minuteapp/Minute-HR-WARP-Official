import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '@/services/documentService';
import { logAccess } from '@/lib/access-logger';
import { supabase } from '@/integrations/supabase/client';
import type { Document } from '@/types/documents';
import { useState } from 'react';

interface DocumentApprovalDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentApprovalDialog: React.FC<DocumentApprovalDialogProps> = ({
  document,
  open,
  onOpenChange,
}) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const resetState = () => {
    setStep(1);
    setAction(null);
    setComment('');
    setRejectionReason('');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const approveMutation = useMutation({
    mutationFn: (documentId: string) => documentService.approveDocument(documentId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['document', document?.id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Dokument erfolgreich freigegeben');
      handleClose(false);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user && document) {
        logAccess({
          employeeId: user.id,
          action: 'Dokument freigegeben',
          module: 'Dokumente',
          category: 'approve',
          details: { documentId: document.id, documentTitle: document.title, comment }
        });
      }
    },
    onError: () => {
      toast.error('Fehler beim Freigeben');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (documentId: string) => documentService.rejectDocument(documentId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['document', document?.id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Dokument abgelehnt');
      handleClose(false);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user && document) {
        logAccess({
          employeeId: user.id,
          action: 'Dokument abgelehnt',
          module: 'Dokumente',
          category: 'approve',
          details: { documentId: document.id, documentTitle: document.title, rejectionReason }
        });
      }
    },
    onError: () => {
      toast.error('Fehler beim Ablehnen');
    }
  });

  const handleSelectAction = (selectedAction: 'approve' | 'reject') => {
    setAction(selectedAction);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setAction(null);
  };

  const handleSubmit = () => {
    if (!document) return;
    
    if (action === 'approve') {
      approveMutation.mutate(document.id);
    } else if (action === 'reject') {
      if (!rejectionReason.trim()) {
        toast.error('Bitte geben Sie einen Ablehnungsgrund an');
        return;
      }
      rejectMutation.mutate(document.id);
    }
  };

  if (!document) return null;

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Freigabe erteilen</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {document.title}
          </p>
        </DialogHeader>
        
        <div className="space-y-5 mt-2">
          {/* Warning Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
              <div className="text-sm text-yellow-800">
                <p>
                  Als Freigabeberechtigter können Sie dieses Dokument freigeben oder ablehnen. 
                  Ihre Entscheidung wird im Audit-Log dokumentiert und ist rechtlich bindend.
                </p>
              </div>
            </div>
          </div>

          {step === 1 ? (
            /* Step 1: Choose Action */
            <div className="grid grid-cols-2 gap-4">
              <button
                className="h-36 flex flex-col items-center justify-center gap-3 border-2 border-green-200 bg-green-50 hover:bg-green-100 rounded-xl transition-colors cursor-pointer"
                onClick={() => handleSelectAction('approve')}
                disabled={isPending}
              >
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-900">Freigeben</div>
                  <div className="text-xs text-green-700 mt-0.5">Dokument genehmigen</div>
                </div>
              </button>
              
              <button
                className="h-36 flex flex-col items-center justify-center gap-3 border-2 border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                onClick={() => handleSelectAction('reject')}
                disabled={isPending}
              >
                <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-7 w-7 text-red-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-900">Ablehnen</div>
                  <div className="text-xs text-red-700 mt-0.5">Dokument zurückweisen</div>
                </div>
              </button>
            </div>
          ) : (
            /* Step 2: Details */
            <div className="space-y-4">
              {/* Selected Action Box */}
              {action === 'approve' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-green-900">Freigeben</div>
                      <div className="text-sm text-green-700">Sie haben sich entschieden, dieses Dokument freizugeben</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-red-900">Ablehnen</div>
                      <div className="text-sm text-red-700">Sie haben sich entschieden, dieses Dokument abzulehnen</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Textarea */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="font-medium text-sm">
                    {action === 'approve' ? 'Kommentar' : 'Ablehnungsgrund'}
                  </label>
                  {action === 'reject' && (
                    <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                      Erforderlich
                    </Badge>
                  )}
                </div>
                <Textarea
                  placeholder={action === 'approve' 
                    ? 'Optional: Fügen Sie einen Kommentar zur Freigabe hinzu...'
                    : 'Bitte geben Sie den Grund für die Ablehnung an...'
                  }
                  value={action === 'approve' ? comment : rejectionReason}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 500);
                    if (action === 'approve') {
                      setComment(value);
                    } else {
                      setRejectionReason(value);
                    }
                  }}
                  className="min-h-[120px] resize-none"
                />
                <div className="text-xs text-muted-foreground text-right mt-1">
                  {(action === 'approve' ? comment : rejectionReason).length}/500
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isPending}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isPending || (action === 'reject' && !rejectionReason.trim())}
                  className={`flex-1 ${
                    action === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {action === 'approve' ? 'Jetzt freigeben' : 'Jetzt ablehnen'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
