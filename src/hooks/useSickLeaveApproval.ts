import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSickLeaveApproval = () => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const approveSickLeave = async (sickLeaveId: string, notes?: string) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Sie müssen angemeldet sein"
      });
      return;
    }

    setIsApproving(true);
    try {
      const { error } = await supabase
        .from('sick_leaves')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          notes: notes || null
        })
        .eq('id', sickLeaveId);

      if (error) throw error;

      toast({
        title: "Krankmeldung genehmigt",
        description: "Die Krankmeldung wurde erfolgreich genehmigt."
      });

      return true;
    } catch (error: any) {
      console.error('Error approving sick leave:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Fehler beim Genehmigen der Krankmeldung"
      });
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  const rejectSickLeave = async (sickLeaveId: string, reason: string) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Sie müssen angemeldet sein"
      });
      return;
    }

    if (!reason || reason.trim() === '') {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte geben Sie einen Grund für die Ablehnung an"
      });
      return;
    }

    setIsRejecting(true);
    try {
      const { error } = await supabase
        .from('sick_leaves')
        .update({
          status: 'rejected',
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          notes: reason
        })
        .eq('id', sickLeaveId);

      if (error) throw error;

      toast({
        title: "Krankmeldung abgelehnt",
        description: "Die Krankmeldung wurde abgelehnt."
      });

      return true;
    } catch (error: any) {
      console.error('Error rejecting sick leave:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Fehler beim Ablehnen der Krankmeldung"
      });
      return false;
    } finally {
      setIsRejecting(false);
    }
  };

  return {
    approveSickLeave,
    rejectSickLeave,
    isApproving,
    isRejecting
  };
};