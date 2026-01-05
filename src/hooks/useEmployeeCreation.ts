import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EmployeeFormData } from "@/types/employee.types";
import { emitEvent } from "@/services/eventEmitterService";
import { employeeOrgService } from "@/services/employeeOrgService";

export const useEmployeeCreation = (onSuccess?: () => void) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEmployee = async (formData: EmployeeFormData) => {
    setIsSubmitting(true);

    try {
      if (formData.employeeNumber) {
        const { data: existingEmployee } = await supabase
          .from('employees')
          .select('id')
          .eq('employee_number', formData.employeeNumber)
          .maybeSingle();

        if (existingEmployee) {
          toast({
            variant: "destructive",
            title: "Fehler",
            description: "Diese Mitarbeiternummer existiert bereits. Bitte wählen Sie eine andere Nummer.",
          });
          setIsSubmitting(false);
          return false;
        }
      }

      // Den vollständigen Namen aus Vor- und Nachname zusammensetzen
      const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Neuer Mitarbeiter';
      
      // Verwende die erweiterte RPC-Funktion mit allen Feldern
      // WICHTIG: p_first_name und p_last_name sind Pflichtfelder!
      const { data, error } = await supabase.rpc(
        'create_employee_without_company_id',
        {
          // Pflicht-Felder zuerst
          p_first_name: formData.firstName || 'Unbekannt',
          p_last_name: formData.lastName || '',
          // Optionale Basis-Daten
          p_name: fullName || null,
          p_email: formData.email || null,
          p_position: formData.position || null,
          p_department: formData.department || null,
          p_team: formData.team || null,
          p_employee_number: formData.employeeNumber || null,
          p_employment_type: formData.employmentType || null,
          p_start_date: formData.startDate || null,
          p_onboarding_required: formData.onboardingRequired || false,
          p_company_id: formData.companyId || null,
          // Persönliche Daten
          p_birth_date: formData.birthDate || null,
          p_nationality: formData.nationality || null,
          p_phone: formData.phone || null,
          p_mobile_phone: formData.mobilePhone || null,
          // Adresse
          p_street: formData.street || null,
          p_city: formData.city || null,
          p_postal_code: formData.postalCode || null,
          p_country: formData.country || null,
          // Notfallkontakt
          p_emergency_contact_name: formData.emergencyContactName || null,
          p_emergency_contact_phone: formData.emergencyContactPhone || null,
          p_emergency_contact_relation: formData.emergencyContactRelation || null,
          // Arbeitszeiten
          p_working_hours: formData.workingHours || 40,
          p_vacation_days: formData.vacationDays || 30,
          p_work_start_time: formData.workStartTime || null,
          p_work_end_time: formData.workEndTime || null,
          p_lunch_break_start: formData.lunchBreakStart || null,
          p_lunch_break_end: formData.lunchBreakEnd || null,
          // Gehalt
          p_salary_amount: formData.salaryAmount || null,
          p_salary_currency: formData.salaryCurrency || 'EUR',
          // Steuer & Sozialversicherung
          p_tax_id: formData.taxId || null,
          p_social_security_number: formData.socialSecurityNumber || null,
          p_tax_class: formData.taxClass || null,
          p_health_insurance: formData.healthInsurance || null,
          // Bank
          p_bank_name: formData.bankName || null,
          p_bank_code: formData.bankCode || null,
          p_bank_account_number: formData.bankAccountNumber || null,
          p_iban: formData.iban || null,
          p_bic: formData.bic || null,
          // Organisation
          p_cost_center: formData.costCenter || null,
          p_manager_id: formData.managerId || null,
          p_contract_end_date: formData.contractEndDate || null,
          // Zusätzliche Felder
          p_probation_months: formData.probationMonths || null,
          p_remote_work: formData.remoteWork || null,
          p_location: formData.location || null
        }
      );

      if (error) {
        console.error("Fehler beim Erstellen des Mitarbeiters:", error);
        toast({
          variant: "destructive",
          title: "Fehler",
          description: `Mitarbeiter konnte nicht hinzugefügt werden: ${error.message}`,
        });
        return false;
      }

      console.log("Mitarbeiter erfolgreich erstellt mit ID:", data);
      
      // Automatische Organigramm-Verknüpfung wenn organizationalUnitId vorhanden
      if (formData.organizationalUnitId && formData.companyId) {
        const roleType = formData.organizationalRoleType || 'member';
        const orgSuccess = await employeeOrgService.assignToUnit(
          data,
          formData.organizationalUnitId,
          roleType,
          formData.companyId
        );
        
        if (orgSuccess) {
          console.log("Mitarbeiter erfolgreich im Organigramm verknüpft");
        } else {
          console.warn("Organigramm-Verknüpfung fehlgeschlagen");
        }
      }
      
      // Event emittieren für Cross-Module-Effects
      await emitEvent(
        'employee.created',
        'employee',
        data,
        'employees',
        {
          name: fullName,
          email: formData.email,
          department: formData.department,
          position: formData.position,
          employment_type: formData.employmentType,
          team: formData.team,
          start_date: formData.startDate,
          organizational_unit_id: formData.organizationalUnitId
        }
      );
      
      toast({
        title: "Erfolg",
        description: "Mitarbeiter wurde erfolgreich hinzugefügt",
      });
      onSuccess?.();
      return true;
    } catch (error: any) {
      console.error("Fehler bei der Mitarbeitererstellung:", error);
      
      let errorMessage = "Mitarbeiter konnte nicht hinzugefügt werden: ";
      
      if (error.message && error.message.includes("duplicate key value violates unique constraint")) {
        if (error.message.includes("employee_number")) {
          errorMessage = "Diese Mitarbeiternummer existiert bereits. Bitte wählen Sie eine andere Nummer.";
        } else {
          errorMessage = "Ein Eintrag mit diesen Daten existiert bereits.";
        }
      } else if (error.message && error.message.includes("row-level security")) {
        errorMessage = "Sie haben keine Berechtigung, Mitarbeiter hinzuzufügen. Bitte wenden Sie sich an Ihren Administrator.";
      } else {
        errorMessage += error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Fehler",
        description: errorMessage,
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createEmployee, isSubmitting };
};
