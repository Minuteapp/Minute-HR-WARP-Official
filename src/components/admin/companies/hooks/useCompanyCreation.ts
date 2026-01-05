import { useState } from "react";
import { CompanyFormData } from "../types";
import { useToast } from "@/hooks/use-toast";
import { createCompany } from "../services/companyService";
import { createDefaultMasterData } from "../services/defaultDataService";

interface CompanyCreationOptions {
  importDefaults?: boolean;
}

export const useCompanyCreation = (onSuccess: () => void) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitCompany = async (
    formData: CompanyFormData, 
    options?: CompanyCreationOptions
  ) => {
    setIsSubmitting(true);
    try {
      const companyId = await createCompany(formData);
      
      // Standard-Stammdaten importieren wenn gewünscht
      if (options?.importDefaults && companyId) {
        try {
          await createDefaultMasterData(companyId, {
            absenceTypes: true,
            departments: false
          });
          console.log("Standard-Stammdaten erfolgreich importiert");
        } catch (defaultsError) {
          console.error("Fehler beim Importieren der Standard-Stammdaten:", defaultsError);
          // Nicht abbrechen, Firma wurde erfolgreich erstellt
        }
      }
      
      toast({
        title: "Firma erfolgreich angelegt",
        description: `Die Firma "${formData.name}" wurde erfolgreich angelegt.`,
      });
      
      // Refresh after successful creation
      onSuccess();
      
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast({
        title: "Fehler beim Anlegen der Firma",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmitCompany,
  };
};
