import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSickLeaveExtension = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitExtension = async (
    sickLeaveId: string,
    newEndDate: Date,
    reason?: string,
    files?: File[]
  ) => {
    setIsSubmitting(true);

    try {
      // Update sick leave record with new end date and pending status
      const { error: updateError } = await supabase
        .from('sick_leaves')
        .update({
          end_date: newEndDate.toISOString(),
          status: 'pending',
          notes: reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sickLeaveId);

      if (updateError) throw updateError;

      // Upload medical certificates if provided
      if (files && files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${sickLeaveId}-${Date.now()}.${fileExt}`;
          const filePath = `sick_leave_documents/${sickLeaveId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('sick_leave_documents')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error uploading document:', uploadError);
            continue;
          }

          // Insert document reference
          const { error: documentError } = await supabase
            .from('sick_leave_documents')
            .insert({
              sick_leave_id: sickLeaveId,
              file_name: file.name,
              file_path: filePath,
              file_type: file.type,
              file_size: file.size,
            });

          if (documentError) {
            console.error('Error saving document reference:', documentError);
          }
        }

        // Update has_documents flag
        await supabase
          .from('sick_leaves')
          .update({ has_documents: true })
          .eq('id', sickLeaveId);
      }

      // Get current user for notification
      const { data: { user } } = await supabase.auth.getUser();
      
      // Send notification to HR and manager
      const { error: notificationError } = await supabase
        .from('unified_notifications')
        .insert({
          user_id: user?.id,
          notification_type: 'sick_leave_extension',
          source_module: 'sick_leave',
          priority: 'high',
          title: 'Krankmeldung verlängert',
          message: `Ein Mitarbeiter hat eine Verlängerung seiner Krankmeldung eingereicht. Neues Enddatum: ${newEndDate.toLocaleDateString('de-DE')}`,
          metadata: {
            sick_leave_id: sickLeaveId,
            new_end_date: newEndDate.toISOString(),
            reason: reason,
          },
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      toast({
        title: 'Verlängerung eingereicht',
        description: 'Ihre Verlängerung wurde erfolgreich eingereicht und muss genehmigt werden.',
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error submitting extension:', error);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message || 'Fehler beim Einreichen der Verlängerung',
      });
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitExtension, isSubmitting };
};
