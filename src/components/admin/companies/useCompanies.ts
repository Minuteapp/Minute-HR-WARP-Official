
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { fetchCompanies } from "./services/fetchCompanies";
import { useCompanyDialog } from "./hooks/useCompanyDialog";
import { useCompanyActions } from "./hooks/useCompanyActions";

export const useCompanies = () => {
  const { toast } = useToast();

  // React Query mit aktualisierter Konfiguration
  const { 
    data: companies = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: fetchCompanies,
    staleTime: 300000, // 5 Minuten stale time
    retry: 1,
    refetchOnWindowFocus: false,
    meta: {
      onError: (err: any) => {
        console.error("React Query error:", err);
        toast({
          title: "Fehler beim Laden der Firmen",
          description: err.message || "Ein unbekannter Fehler ist aufgetreten",
          variant: "destructive"
        });
      }
    }
  });

  // Company dialog state and actions
  const { 
    isNewCompanyDialogOpen, 
    setIsNewCompanyDialogOpen,
    isSubmitting, 
    handleCreateCompany, 
    handleSubmitCompany, 
    handleEditCompany 
  } = useCompanyDialog(() => refetch());

  // Company actions
  const { handleDeactivateCompany, handleDeleteCompany } = useCompanyActions(() => refetch());

  return {
    companies,
    isLoading,
    error,
    isNewCompanyDialogOpen,
    setIsNewCompanyDialogOpen,
    isSubmitting,
    handleCreateCompany,
    handleSubmitCompany,
    handleEditCompany,
    handleDeactivateCompany,
    handleDeleteCompany,
    refetch // Refetch-Funktion zurückgeben
  };
};
