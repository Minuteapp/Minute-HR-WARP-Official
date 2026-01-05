
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { absenceService } from '@/services/absenceService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AbsenceRejectDialog } from './AbsenceRejectDialog';

interface AbsenceApprovalActionsProps {
  requestId: string;
  onApprove?: () => void;
  onReject?: () => void;
}

export const AbsenceApprovalActions = ({ 
  requestId, 
  onApprove, 
  onReject 
}: AbsenceApprovalActionsProps) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const queryClient = useQueryClient();

  const createNotification = async (requestId: string, type: string, message: string) => {
    try {
      // Hole die Anfrage um die user_id zu bekommen
      const { data: request } = await supabase
        .from('absence_requests')
        .select('user_id')
        .eq('id', requestId)
        .single();

      if (request) {
        await supabase
          .from('absence_notifications')
          .insert({
            absence_request_id: requestId,
            user_id: request.user_id,
            notification_type: type,
            message: message,
            read: false
          });
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Benachrichtigung:', error);
    }
  };

  const approveMutation = useMutation({
    mutationFn: async () => {
      const result = await absenceService.approveRequest(requestId);
      if (result) {
        await createNotification(
          requestId, 
          'approval', 
          'Ihr Abwesenheitsantrag wurde genehmigt.'
        );
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absence-requests'] });
      queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['absence-notifications'] });
      toast.success('Antrag wurde genehmigt');
      onApprove?.();
    },
    onError: () => {
      toast.error('Fehler beim Genehmigen des Antrags');
    }
  });

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => approveMutation.mutate()}
          disabled={approveMutation.isPending}
          className="text-success hover:text-success hover:bg-success/10"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          {approveMutation.isPending ? 'Genehmige...' : 'Genehmigen'}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowRejectDialog(true)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Ablehnen
        </Button>
      </div>

      <AbsenceRejectDialog
        requestId={requestId}
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onReject={onReject}
      />
    </>
  );
};
