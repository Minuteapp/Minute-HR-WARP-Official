
import { useToast } from "@/hooks/use-toast";
import { deactivateCompany } from "../services/companyService";
import { supabase } from "@/integrations/supabase/client";

export const useCompanyDeactivation = (onSuccess: () => void) => {
  const { toast } = useToast();

  const handleDeactivateCompany = async (companyId: string) => {
    try {
      // Hole aktuellen Firmenstatus
      const { data: company, error: fetchError } = await supabase
        .from('companies')
        .select('is_active')
        .eq('id', companyId)
        .single();

      if (fetchError) throw fetchError;

      // Aktualisiere den Status
      const { error } = await supabase
        .from('companies')
        .update({ 
          is_active: !company.is_active,
          subscription_start_date: !company.is_active ? new Date().toISOString() : null
        })
        .eq('id', companyId);

      if (error) throw error;
      
      toast({
        title: company.is_active ? "Firma deaktiviert" : "Firma aktiviert",
        description: company.is_active 
          ? "Die Firma wurde erfolgreich deaktiviert."
          : "Die Firma wurde erfolgreich aktiviert. Die Abrechnung beginnt ab jetzt.",
      });
      
      // Refresh nach Statusänderung
      onSuccess();
      
    } catch (error: any) {
      console.error("Error during company status change:", error);
      toast({
        title: "Fehler bei der Statusänderung",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive"
      });
    }
  };

  return {
    handleDeactivateCompany
  };
};
