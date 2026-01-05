
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createAdminInvitationService, createAdminUserWithPasswordService } from "../services/admin";

interface UseAdminCreationProps {
  companyId: string;
  companyName: string;
  onSuccess?: () => void;
}

export const useAdminCreation = ({ 
  companyId, 
  companyName, 
  onSuccess 
}: UseAdminCreationProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createAdminInvitation = async (
    email: string, 
    name: string, 
    phone: string = "",
    position: string = "",
    salutation: string = "Herr",
    password?: string,
    createDirectly: boolean = false
  ) => {
    if (!email || !companyId) {
      toast({
        title: "Fehler beim Erstellen der Einladung",
        description: "E-Mail oder Firmen-ID fehlt",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreating(true);
      
      if (createDirectly && password) {
        console.log("Creating admin user directly with password for:", email, "company:", companyId);
        
        await createAdminUserWithPasswordService(
          email,
          password,
          companyId,
          name,
          phone || null,
          position || null,
          salutation || 'Herr'
        );
        
        toast({
          title: "Admin erstellt",
          description: `Administrator ${email} wurde erfolgreich erstellt und kann sich sofort einloggen.`
        });
      } else {
        console.log("Creating admin invitation for:", email, "company:", companyId);
        
        // Explizit nur Admins mit Firmenverknüpfung erstellen, niemals Superadmins
        await createAdminInvitationService(
          email, 
          companyId, 
          name, 
          phone || null, 
          position || null, 
          salutation || 'Herr'
        );
        
        toast({
          title: "Einladung erstellt",
          description: `Eine Einladung für ${email} wurde erstellt. Bitte senden Sie eine Einladung, um den Zugriff zu aktivieren.`
        });
      }
      
      if (onSuccess) {
        await onSuccess();
      }
      
    } catch (error: any) {
      console.error("Error creating admin invitation:", error);
      toast({
        title: "Fehler beim Erstellen des Administrators",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createAdminInvitation,
    isCreating
  };
};
