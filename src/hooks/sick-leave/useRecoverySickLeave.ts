import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';

export const useRecoverySickLeave = () => {
  const [isReporting, setIsReporting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const reportRecovery = async (sickLeaveId: string, recoveryDate: Date, notes?: string) => {
    setIsReporting(true);

    try {
      // Update sick leave with new end date and mark as completed
      const { error: updateError } = await supabase
        .from('sick_leaves')
        .update({
          end_date: recoveryDate.toISOString().split('T')[0],
          status: 'completed',
          notes: notes ? `Genesung gemeldet: ${notes}` : 'Genesung gemeldet',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sickLeaveId);

      if (updateError) {
        throw new Error(`Fehler beim Melden der Genesung: ${updateError.message}`);
      }

      // Send notification to supervisor and HR
      await supabase.from('unified_notifications').insert({
        user_id: user?.id,
        notification_type: 'sick_leave_recovery',
        source_module: 'sick_leave',
        priority: 'medium',
        title: 'Genesung gemeldet',
        message: `Ein Mitarbeiter hat seine Genesung gemeldet.`,
        metadata: {
          sick_leave_id: sickLeaveId,
          recovery_date: recoveryDate.toISOString(),
        },
      });

      toast({
        title: 'Genesung gemeldet',
        description: 'Ihre Genesung wurde erfolgreich gemeldet.',
      });

      return true;
    } catch (error: any) {
      console.error('Error reporting recovery:', error);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message || 'Fehler beim Melden der Genesung',
      });
      return false;
    } finally {
      setIsReporting(false);
    }
  };

  return {
    reportRecovery,
    isReporting,
  };
};
