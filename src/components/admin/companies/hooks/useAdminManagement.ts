
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  updateAdminService, 
  deleteAdminService 
} from "../services/admin";

interface UseAdminManagementProps {
  companyId: string;
  onSuccess?: () => void;
}

export const useAdminManagement = ({
  companyId,
  onSuccess
}: UseAdminManagementProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const updateAdmin = async (
    adminId: string, 
    data: { 
      name: string; 
      phone?: string; 
      position?: string;
      salutation?: string;
    }
  ) => {
    if (!adminId || !companyId) {
      toast({
        title: "Fehler beim Aktualisieren des Administrators",
        description: "Admin-ID oder Firmen-ID fehlt",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      console.log("Updating admin:", adminId, "with data:", data);
      
      await updateAdminService(
        adminId,
        companyId,
        data.name,
        data.phone || null,
        data.position || null,
        data.salutation || 'Herr'
      );
      
      toast({
        title: "Admin aktualisiert",
        description: `Die Daten wurden erfolgreich gespeichert.`
      });
      
      if (onSuccess) {
        await onSuccess();
      }
      
    } catch (error: any) {
      console.error("Error updating admin:", error);
      toast({
        title: "Fehler beim Aktualisieren des Administrators",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteAdmin = async (adminId: string) => {
    if (!adminId || !companyId) {
      toast({
        title: "Fehler beim Löschen des Administrators",
        description: "Admin-ID oder Firmen-ID fehlt",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      console.log("Deleting admin:", adminId, "company:", companyId);
      
      await deleteAdminService(adminId, companyId);
      
      toast({
        title: "Admin gelöscht",
        description: `Der Administrator wurde erfolgreich entfernt.`
      });
      
      if (onSuccess) {
        await onSuccess();
      }
      
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      toast({
        title: "Fehler beim Löschen des Administrators",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    updateAdmin,
    deleteAdmin,
    isProcessing
  };
};
