
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCompanyCreation } from "./useCompanyCreation";
import { CompanyFormData } from "../types";

export const useCompanyDialog = (onSuccess: () => void) => {
  const [isNewCompanyDialogOpen, setIsNewCompanyDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isSubmitting, handleSubmitCompany: submitCompany } = useCompanyCreation(() => {
    // Schließe den Dialog nach erfolgreicher Erstellung
    setIsNewCompanyDialogOpen(false);
    // Rufe dann onSuccess auf, um die Firmenliste zu aktualisieren
    onSuccess();
  });

  const handleCreateCompany = () => {
    setIsNewCompanyDialogOpen(true);
  };

  const handleSubmitCompany = async (formData: CompanyFormData) => {
    await submitCompany(formData);
  };

  const handleEditCompany = (companyId: string) => {
    toast({
      title: "Noch nicht implementiert",
      description: "Diese Funktion wird in Kürze verfügbar sein.",
    });
  };

  return {
    isNewCompanyDialogOpen,
    setIsNewCompanyDialogOpen,
    isSubmitting,
    handleCreateCompany,
    handleSubmitCompany,
    handleEditCompany
  };
};
