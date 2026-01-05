
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompanyDetailsLoader } from "./useCompanyDetailsLoader";
import { useAdminInvitation } from "./useAdminInvitation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useCompanyDetails = (companyId: string | undefined | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  const { 
    company, 
    isLoading,
    notFound, 
    error,
    loadCompanyDetails,
    setCompany 
  } = useCompanyDetailsLoader(companyId, (error) => {
    // Nur bei kritischen Fehlern zur Admin-Seite navigieren, nicht bei "not found"
    if (error.message.includes("permission denied") || error.message.includes("network")) {
      toast({
        title: "Fehler beim Laden der Firmendaten",
        description: error?.message || "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive"
      });
      setTimeout(() => navigate("/admin"), 2000);
    }
  });

  const { createAdminInvitation, sendInvitation, isSending } = useAdminInvitation({
    companyId: companyId || '',
    companyName: company?.name || '',
    onSuccess: () => {
      // Refresh company details after invitation is sent
      loadCompanyDetails();
    }
  });

  useEffect(() => {
    // Wenn companyId null ist, nicht laden (wird von useCompanyDetailsPage kontrolliert)
    if (companyId === null) {
      return;
    }

    // Prüfe auf ungültige companyId Werte
    if (!companyId || companyId === 'undefined' || companyId === 'null' || companyId === '') {
      console.log("Invalid or missing companyId, navigating back to admin");
      navigate("/admin");
      return;
    }

    // Prüfe UUID-Format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(companyId)) {
      console.log("Invalid UUID format for companyId, navigating back to admin");
      navigate("/admin");
      return;
    }

    console.log(`useCompanyDetails - Loading details for company ID: ${companyId} (Attempt ${loadAttempts + 1})`);
    loadCompanyDetails();
  }, [companyId, navigate, loadAttempts]);

  // Funktion zum erneuten Laden der Firmendaten
  const refreshCompanyDetails = async () => {
    if (companyId) {
      setLoadAttempts(prev => prev + 1);
      await loadCompanyDetails();
    }
  };

  const handleAddAdmin = async (
    email: string, 
    name: string, 
    phone: string = "", 
    position: string = "", 
    salutation: string = "Herr",
    password?: string,
    createDirectly: boolean = false
  ) => {
    if (companyId) {
      try {
        await createAdminInvitation(email, name, phone, position, salutation, password, createDirectly);
        setIsAddAdminDialogOpen(false);
        refreshCompanyDetails(); // Refresh to show the new admin
      } catch (error: any) {
        toast({
          title: "Fehler beim Hinzufügen des Administrators",
          description: error.message || "Ein unbekannter Fehler ist aufgetreten",
          variant: "destructive"
        });
      }
    }
  };

  const handleResendInvitation = async (adminEmail: string) => {
    if (company) {
      try {
        await sendInvitation(adminEmail);
        toast({
          title: "E-Mail gesendet",
          description: `Eine E-Mail wurde an ${adminEmail} gesendet.`
        });
        refreshCompanyDetails(); // Refresh to update admin status
      } catch (error: any) {
        toast({
          title: "Fehler beim Senden der E-Mail",
          description: error.message || "Ein unbekannter Fehler ist aufgetreten",
          variant: "destructive"
        });
      }
    }
  };

  return { 
    company, 
    isLoading,
    notFound,
    error,
    refreshCompanyDetails,
    isAddAdminDialogOpen,
    setIsAddAdminDialogOpen,
    handleAddAdmin,
    handleResendInvitation,
    isSending
  };
};
