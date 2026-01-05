import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthProvider";

export const useSickLeaveSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const submitSickLeave = async ({
    userData,
    files,
    userId
  }: {
    userData: any;
    files: File[];
    userId: string;
  }) => {
    setIsSubmitting(true);

    try {
      // KRITISCH: Session prüfen vor dem Request
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error("Keine gültige Session:", sessionError);
        throw new Error("Bitte melden Sie sich erneut an. Ihre Sitzung ist abgelaufen.");
      }

      console.log("Session vorhanden, User ID:", sessionData.session.user.id);
      
      // Verwende die Session-User-ID für RLS-Kompatibilität
      const authUserId = sessionData.session.user.id;

      // Hole die effektive company_id für Tenant-Modus
      const { data: companyId } = await supabase.rpc('get_effective_company_id');
      console.log("Effective company_id:", companyId);

      // Insert the sick leave record
      const { data: sickLeaveData, error: sickLeaveError } = await supabase
        .from('sick_leaves')
        .insert({
          user_id: authUserId,
          company_id: companyId, // Wichtig für RLS
          start_date: userData.startDate.toISOString().split('T')[0],
          end_date: userData.endDate ? userData.endDate.toISOString().split('T')[0] : userData.startDate.toISOString().split('T')[0],
          description: userData.reason || null,
          notes: userData.notes || null,
          status: 'pending',
          has_contacted_doctor: files.length > 0,
        })
        .select()
        .single();

      if (sickLeaveError) {
        console.error("Sick leave insert error:", sickLeaveError);
        throw new Error(`Fehler beim Speichern der Krankmeldung: ${sickLeaveError.message}`);
      }

      // Upload documents if provided
      if (files.length > 0 && sickLeaveData) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${authUserId}-${Date.now()}.${fileExt}`;
          const filePath = `${sickLeaveData.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('sick-leave-documents')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
          }
        }
      }

      // Send notification
      await supabase.from('unified_notifications').insert({
        user_id: authUserId,
        notification_type: 'sick_leave_submitted',
        source_module: 'sick_leave',
        priority: 'medium',
        title: 'Neue Krankmeldung',
        message: `Eine neue Krankmeldung wurde eingereicht.`,
        metadata: {
          sick_leave_id: sickLeaveData.id,
          start_date: userData.startDate.toISOString(),
          end_date: userData.endDate?.toISOString(),
        },
      });

      toast({
        title: "Krankmeldung eingereicht",
        description: "Ihre Krankmeldung wurde erfolgreich eingereicht.",
      });

      return sickLeaveData;
    } catch (error: any) {
      console.error("Fehler bei der Krankmeldung:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Fehler beim Einreichen der Krankmeldung"
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitSickLeave,
    isSubmitting,
  };
};
