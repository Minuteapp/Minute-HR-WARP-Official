
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AdminFormData } from "../types";
import { useAdminInvitation } from "./useAdminInvitation";

type FormErrors = {
  [key: string]: string;
};

export const useAdminForm = (props?: {
  companyId?: string;
  companyName?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  initialData?: AdminFormData;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<AdminFormData>(props?.initialData || {
    email: "",
    name: "",
    phone: "",
    salutation: "Herr",
    first_name: "",
    last_name: "",
    position: "",
    password: "",
    createDirectly: false
  });

  const { createAdminInvitation } = useAdminInvitation({
    companyId: props?.companyId || '',
    companyName: props?.companyName || '',
    onSuccess: props?.onSuccess
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user makes a change
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Update the name field when first or last name changes
    if (name === "first_name" || name === "last_name") {
      const firstName = name === "first_name" ? value : formData.first_name;
      const lastName = name === "last_name" ? value : formData.last_name;
      
      setFormData(prev => ({
        ...prev,
        name: `${firstName} ${lastName}`.trim()
      }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.email) {
      newErrors.email = "E-Mail ist erforderlich";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ungültige E-Mail-Adresse";
    }
    
    if (!formData.first_name) {
      newErrors.first_name = "Vorname ist erforderlich";
    }
    
    if (!formData.last_name) {
      newErrors.last_name = "Nachname ist erforderlich";
    }
    
    if (!formData.salutation) {
      newErrors.salutation = "Anrede ist erforderlich";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      phone: "",
      salutation: "Herr",
      first_name: "",
      last_name: "",
      position: "",
      password: "",
      createDirectly: false
    });
    setErrors({});
  };

  const isFormValid = () => {
    // Basic validation
    if (!formData.email || !formData.first_name || !formData.last_name) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Ungültige Eingaben",
        description: "Bitte überprüfen Sie Ihre Eingaben",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (props?.companyId) {
        // Create the admin invitation with all fields
        await createAdminInvitation(
          formData.email,
          formData.name,
          formData.phone || "",
          formData.position || "",
          formData.salutation
        );
      }
      
      // Close the dialog if a close handler was provided
      if (props?.onClose) {
        props.onClose();
      }
      
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast({
        title: "Fehler beim Anlegen des Administrators",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSelectChange,
    handleSubmit,
    resetForm,
    validateForm,
    isFormValid,
    setFormData
  };
};
