import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSickLeaveRecovery = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const reportRecovery = async (
    sickLeaveId: string,
    recoveryDate: Date,
    notes?: string
  ) => {
    setIsSubmitting(true);

    try {
      // Update sick leave record
      const { error: updateError } = await supabase
        .from('sick_leaves')
        .update({
          end_date: recoveryDate.toISOString(),
          status: 'completed',
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sickLeaveId);

      if (updateError) throw updateError;

      // Get current user for notification
      const { data: { user } } = await supabase.auth.getUser();
      
      // Send notification to HR and manager
      const { error: notificationError } = await supabase
        .from('unified_notifications')
        .insert({
          user_id: user?.id,
          notification_type: 'sick_leave_recovery',
          source_module: 'sick_leave',
          priority: 'medium',
          title: 'Genesung gemeldet',
          message: `Ein Mitarbeiter hat seine Genesung gemeldet. Arbeitsfähig ab ${recoveryDate.toLocaleDateString('de-DE')}`,
          metadata: {
            sick_leave_id: sickLeaveId,
            recovery_date: recoveryDate.toISOString(),
            notes: notes,
          },
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      toast({
        title: 'Genesung gemeldet',
        description: 'Ihre Genesung wurde erfolgreich gemeldet.',
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error reporting recovery:', error);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message || 'Fehler beim Melden der Genesung',
      });
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { reportRecovery, isSubmitting };
};
