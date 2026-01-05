import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';

export const useExtendSickLeave = () => {
  const [isExtending, setIsExtending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const extendSickLeave = async (
    sickLeaveId: string,
    newEndDate: Date,
    extensionReason?: string,
    files?: File[]
  ) => {
    setIsExtending(true);

    try {
      // Update sick leave with new end date and set status to pending (requires re-approval)
      const { error: updateError } = await supabase
        .from('sick_leaves')
        .update({
          end_date: newEndDate.toISOString().split('T')[0],
          status: 'pending',
          notes: extensionReason ? `Verlängerung: ${extensionReason}` : 'Verlängerung eingereicht',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sickLeaveId);

      if (updateError) {
        throw new Error(`Fehler beim Verlängern der Krankmeldung: ${updateError.message}`);
      }

      // Upload certificate documents if provided
      if (files && files.length > 0 && user?.id) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-extension-${Date.now()}.${fileExt}`;
          const filePath = `${sickLeaveId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('sick-leave-documents')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
          }
        }
      }

      // Send notification to supervisor and HR
      await supabase.from('unified_notifications').insert({
        type: 'sick_leave_extension',
        source_module: 'sick_leave',
        priority: 'high',
        title: 'Krankmeldung verlängert',
        message: `Eine Krankmeldung wurde verlängert und benötigt Genehmigung.`,
        metadata: {
          sick_leave_id: sickLeaveId,
          new_end_date: newEndDate.toISOString(),
          extension_reason: extensionReason,
          user_id: user?.id,
        },
      });

      toast({
        title: 'Verlängerung eingereicht',
        description: 'Ihre Verlängerung wurde erfolgreich eingereicht und wartet auf Genehmigung.',
      });

      return true;
    } catch (error: any) {
      console.error('Error extending sick leave:', error);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message || 'Fehler beim Verlängern der Krankmeldung',
      });
      return false;
    } finally {
      setIsExtending(false);
    }
  };

  return {
    extendSickLeave,
    isExtending,
  };
};
