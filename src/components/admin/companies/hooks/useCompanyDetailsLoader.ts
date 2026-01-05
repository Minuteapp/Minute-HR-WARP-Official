
import { useState } from "react";
import { CompanyDetails } from "../types";
import { fetchCompanyDetails } from "../services/fetchCompanyDetails";
import { useToast } from "@/hooks/use-toast";

export const useCompanyDetailsLoader = (
  companyId: string | undefined | null, 
  onError?: (error: Error) => void
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadCompanyDetails = async () => {
    if (!companyId || companyId === null) {
      console.log("No company ID provided");
      setIsLoading(false);
      setNotFound(true);
      setError(new Error("Keine Firmen-ID angegeben"));
      return;
    }

    try {
      setIsLoading(true);
      setNotFound(false);
      setError(null);
      
      console.log("Loading company details for ID:", companyId);
      const data = await fetchCompanyDetails(companyId);
      
      if (data === null) {
        console.log("Company not found with ID:", companyId);
        setNotFound(true);
        toast({
          title: "Firma nicht gefunden",
          description: "Die angeforderte Firma konnte nicht in der Datenbank gefunden werden.",
          variant: "destructive"
        });
      } else {
        console.log("Successfully loaded company:", data.name);
        console.log("DEBUG: Company admins from Edge Function:", data.companyAdmins);
        console.log("DEBUG: Company employees from Edge Function:", data.employees);
        console.log("DEBUG: Admin count:", data.companyAdmins?.length || 0);
        console.log("DEBUG: Employee count from edge:", data.employees?.length || 0);
        setCompany(data);
      }
    } catch (error: any) {
      console.error("Failed to load company details:", error);
      
      // Detailliertere Fehlermeldung 
      let errorMessage = error.message || "Ein unbekannter Fehler ist aufgetreten";
      
      // Spezifische Fehlermeldungen für verschiedene Fehlertypen
      if (errorMessage.includes("permission denied")) {
        errorMessage = "Sie haben keine Berechtigung, diese Firma anzusehen";
      } else if (errorMessage.includes("network")) {
        errorMessage = "Netzwerkfehler: Bitte überprüfen Sie Ihre Internetverbindung";
      } else if (errorMessage.includes("Edge Function")) {
        errorMessage = "Serverfehler: Bitte versuchen Sie es später erneut";
      }
      
      toast({
        title: "Fehler beim Laden der Firmendaten",
        description: errorMessage,
        variant: "destructive"
      });
      
      // notFound setzen, um die richtige UI anzuzeigen
      setNotFound(true);
      setError(error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    company, 
    isLoading,
    notFound,
    error,
    loadCompanyDetails, 
    setCompany 
  };
};
