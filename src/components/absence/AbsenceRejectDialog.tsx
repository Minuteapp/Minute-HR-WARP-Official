
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { XCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AbsenceRejectDialogProps {
  requestId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject?: () => void;
}

export const AbsenceRejectDialog = ({ 
  requestId, 
  open, 
  onOpenChange, 
  onReject 
}: AbsenceRejectDialogProps) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  const createNotification = async (requestId: string, reason: string) => {
    try {
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
            notification_type: 'rejection',
            message: reason 
              ? `Ihr Abwesenheitsantrag wurde abgelehnt. Grund: ${reason}`
              : 'Ihr Abwesenheitsantrag wurde abgelehnt.',
            read: false
          });
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Benachrichtigung:', error);
    }
  };

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sie müssen angemeldet sein, um Anträge abzulehnen');
      }

      const { data, error } = await supabase
        .from('absence_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason || null,
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Benachrichtigung erstellen
      await createNotification(requestId, rejectionReason);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absence-requests'] });
      queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['absence-notifications'] });
      toast.success('Antrag wurde abgelehnt');
      setRejectionReason('');
      onOpenChange(false);
      onReject?.();
    },
    onError: (error) => {
      console.error('Fehler beim Ablehnen des Antrags:', error);
      toast.error('Fehler beim Ablehnen des Antrags');
    }
  });

  const handleReject = () => {
    rejectMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Antrag ablehnen
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Grund für die Ablehnung (optional)
            </Label>
            <Textarea
              id="reason"
              placeholder="Bitte geben Sie einen Grund für die Ablehnung an..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={rejectMutation.isPending}
          >
            Abbrechen
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReject}
            disabled={rejectMutation.isPending}
          >
            {rejectMutation.isPending ? 'Lehne ab...' : 'Ablehnen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
