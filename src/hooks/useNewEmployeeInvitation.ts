
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NewEmployeeFormData } from "@/types/onboarding.types";

export const useNewEmployeeInvitation = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEmployeeWithOnboarding = async (formData: NewEmployeeFormData) => {
    setIsSubmitting(true);

    try {
      // Company ID ermitteln
      const { data: companyId, error: companyError } = await supabase.rpc('get_effective_company_id');
      
      if (companyError || !companyId) {
        console.error("Fehler beim Ermitteln der Unternehmens-ID:", companyError);
        toast({
          title: "Fehler",
          description: "Unternehmens-ID konnte nicht ermittelt werden. Bitte melden Sie sich erneut an.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Vollständigen Namen aus Vor- und Nachname erstellen
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Verwenden der Bypass-Funktion anstelle der direkten Einfügung
      const { data, error } = await supabase.rpc(
        'create_employee_bypass_rls',
        {
          p_name: fullName,
          p_email: formData.email,
          p_first_name: formData.firstName,
          p_last_name: formData.lastName,
          p_position: formData.position,
          p_department: formData.department,
          p_team: null,
          p_employee_number: null,
          p_employment_type: 'full_time',
          p_start_date: formData.startDate,
          p_status: 'active',
          p_onboarding_required: true
        }
      );

      if (error) {
        console.error("Fehler beim Erstellen des Mitarbeiters:", error);
        
        let errorMessage = error.message;
        if (error.message.includes('company_id') || error.message.includes('Unternehmens-ID')) {
          errorMessage = 'Unternehmens-ID fehlt. Bitte melden Sie sich erneut an oder wechseln Sie den Mandanten.';
        }
        
        toast({
          title: "Fehler",
          description: `Mitarbeiter konnte nicht hinzugefügt werden: ${errorMessage}`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const employeeId = data;
      
      // Erstellen eines Onboarding-Prozesses für den neuen Mitarbeiter
      const { error: onboardingError } = await supabase
        .from('onboarding_processes')
        .insert({
          employee_id: employeeId,
          start_date: formData.startDate,
          end_date: new Date(new Date(formData.startDate).getTime() + 30 * 24 * 60 * 60 * 1000),
          status: 'active',
          mentor_id: formData.mentorId !== 'no_mentor' ? formData.mentorId : null,
          tasks: [],
          progress: 0,
          company_id: companyId
        });

      if (onboardingError) {
        console.error("Fehler beim Erstellen des Onboarding-Prozesses:", onboardingError);
        toast({
          title: "Teilweiser Erfolg",
          description: "Mitarbeiter erstellt, aber der Onboarding-Prozess konnte nicht gestartet werden.",
          variant: "default"
        });
      } else {
        toast({
          title: "Erfolg",
          description: "Neuer Mitarbeiter erfolgreich eingeladen und Onboarding gestartet.",
        });
      }

    } catch (error: any) {
      console.error("Fehler bei der Mitarbeitereinladung:", error);
      toast({
        title: "Fehler",
        description: `Fehler beim Erstellen des Mitarbeiters: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createEmployeeWithOnboarding, isSubmitting };
};
