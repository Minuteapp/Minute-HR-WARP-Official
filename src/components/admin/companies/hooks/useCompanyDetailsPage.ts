
import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCompanyDetails } from "./useCompanyDetails";
import { useToast } from "@/hooks/use-toast";
import { useCompanyDeletion } from "./useCompanyDeletion";

export const useCompanyDetailsPage = (rawCompanyId?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Validiere die companyId - filtere ungültige Werte heraus
  const companyId = useMemo(() => {
    if (!rawCompanyId || rawCompanyId === 'undefined' || rawCompanyId === 'null' || rawCompanyId === '') {
      return undefined;
    }
    
    // Prüfe UUID-Format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(rawCompanyId)) {
      return undefined;
    }
    
    return rawCompanyId;
  }, [rawCompanyId]);

  console.log("useCompanyDetailsPage - Raw companyId from params:", rawCompanyId);
  console.log("useCompanyDetailsPage - Validated companyId:", companyId);

  // Umleitung nur bei eindeutig ungültiger ID nach kurzer Verzögerung
  useEffect(() => {
    if (!companyId && rawCompanyId) {
      // Warte kurz bevor wir umleiten - falls die URL-Parameter noch laden
      const timer = setTimeout(() => {
        if (!companyId && rawCompanyId) {
          console.log("Invalid companyId detected after delay, redirecting to companies page");
          toast({
            title: "Ungültige Firmen-ID",
            description: "Die angegebene Firmen-ID ist nicht gültig. Sie werden zur Übersicht weitergeleitet.",
            variant: "destructive"
          });
          navigate("/admin/companies", { replace: true });
        }
      }, 100); // Kurze Verzögerung um Race Conditions zu vermeiden
      
      return () => clearTimeout(timer);
    }
  }, [companyId, rawCompanyId, navigate, toast]);

  // Verhindere das Laden wenn die ID ungültig ist
  const shouldLoadData = companyId !== undefined;

  const { 
    company, 
    isLoading, 
    notFound, 
    error,
    refreshCompanyDetails,
    handleAddAdmin,
    handleResendInvitation,
    isAddAdminDialogOpen,
    setIsAddAdminDialogOpen
  } = useCompanyDetails(shouldLoadData ? companyId : null);

  // Use useCompanyDeletion with fixed handling
  const { handleDeleteCompany, isDeleting } = useCompanyDeletion();

  // Reset dialog state when component unmounts
  useEffect(() => {
    return () => {
      setIsDeleteDialogOpen(false);
    };
  }, []);

  // Close dialog when deletion starts
  useEffect(() => {
    if (isDeleting) {
      setIsDeleteDialogOpen(false);
    }
  }, [isDeleting]);

  const handleBack = useCallback(() => {
    navigate("/admin/companies");
  }, [navigate]);

  const handleEditCompany = useCallback(() => {
    toast({
      title: "Funktion noch nicht implementiert",
      description: "Die Bearbeitungsfunktion wird in einem zukünftigen Update hinzugefügt."
    });
  }, [toast]);

  const handleDeleteCompanyConfirm = useCallback(async () => {
    if (!companyId) {
      toast({
        title: "Fehler beim Löschen",
        description: "Keine Firmen-ID angegeben.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Deletion confirmed, closing dialog and initiating deletion");
      
      // Close dialog first
      setIsDeleteDialogOpen(false);
      
      // ALWAYS use true for navigation after deletion - simplified logic
      await handleDeleteCompany(companyId, true);
    } catch (error: any) {
      console.error("Error in handleDeleteCompany:", error);
      // Error handling happens in the hook
    }
  }, [companyId, handleDeleteCompany, toast]);

  return {
    companyId,
    company,
    isLoading,
    notFound,
    error,
    handleBack,
    handleEditCompany,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    handleDeleteCompany: handleDeleteCompanyConfirm,
    isAddAdminDialogOpen,
    setIsAddAdminDialogOpen,
    handleAddAdmin,
    handleResendInvitation,
    refreshCompanyDetails
  };
};
