
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CompanyAdmin } from "../types";

interface UseEditAdminFormProps {
  admin: CompanyAdmin | null;
  onSave: (adminId: string, data: { name: string; phone: string; position: string; salutation: string; }) => Promise<void>;
  onClose: () => void;
}

export const useEditAdminForm = ({ admin, onSave, onClose }: UseEditAdminFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    salutation: "Herr",
    firstName: "",
    lastName: "",
    phone: "",
    position: ""
  });
  
  useEffect(() => {
    if (admin) {
      // Get admin's name (using full_name or name property, falling back to email)
      const displayName = admin.full_name || admin.name || admin.email;
      
      // Split name into first and last name if possible
      const nameParts = displayName.split(' ');
      const firstName = nameParts.length > 0 ? nameParts[0] : '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      setFormData({
        salutation: admin.salutation || "Herr",
        firstName,
        lastName,
        phone: admin.phone || "",
        position: admin.position || ""
      });
    }
  }, [admin]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      salutation: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!admin) return;
    
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Ungültige Eingaben",
        description: "Bitte geben Sie Vor- und Nachname ein",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      await onSave(admin.id, {
        name: fullName,
        phone: formData.phone,
        position: formData.position,
        salutation: formData.salutation
      });
      
      toast({
        title: "Admin aktualisiert",
        description: "Die Daten wurden erfolgreich gespeichert."
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error updating admin:", error);
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    handleChange,
    handleSelectChange,
    handleSubmit
  };
};
