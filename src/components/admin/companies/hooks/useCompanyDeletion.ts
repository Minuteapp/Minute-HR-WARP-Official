
import { useToast } from "@/hooks/use-toast";
import { deleteCompany } from "../services/deleteCompany";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useCompanyDeletion = (onSuccess?: () => void) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteCompany = useCallback(async (companyId: string, shouldNavigate = false) => {
    if (!companyId) {
      toast({
        title: "Fehler beim Löschen",
        description: "Keine Firmen-ID angegeben.",
        variant: "destructive"
      });
      return;
    }
    
    // If already deleting, prevent duplicate operations
    if (isDeleting) {
      console.log("Delete operation already in progress, ignoring duplicate request");
      return;
    }
    
    console.log("Starting company deletion process for ID:", companyId);
    
    // Set deleting state immediately
    setIsDeleting(true);
    
    try {
      // Perform the actual deletion first
      await deleteCompany(companyId);
      console.log("Company deletion successful");
      
      // Show success message
      toast({
        title: "Firma gelöscht",
        description: "Die Firma wurde erfolgreich gelöscht.",
      });
      
      // Force hard navigation to guarantee complete state reset
      window.location.href = "/admin";
      
    } catch (error: any) {
      console.error("Error during company deletion:", error);
      toast({
        title: "Fehler beim Löschen der Firma",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive"
      });
      // Reset state on error
      setIsDeleting(false);
    }
  }, [isDeleting, toast, navigate, onSuccess]);

  return {
    handleDeleteCompany,
    isDeleting
  };
};
