
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AdminFormData } from "../types";

interface UseAdminCreateFormProps {
  onAddAdmin: (email: string, name: string, phone: string, position: string, salutation: string, password?: string, createDirectly?: boolean) => void;
  onClose: () => void;
}

export const useAdminCreateForm = ({ onAddAdmin, onClose }: UseAdminCreateFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<AdminFormData>({
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

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Clear password error when switching to invitation mode
    if (name === "createDirectly" && !checked && errors.password) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
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
    
    if (formData.createDirectly && (!formData.password || formData.password.length < 6)) {
      newErrors.password = "Passwort muss mindestens 6 Zeichen lang sein";
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
    
    setIsSubmitting(true);
    
    try {
      await onAddAdmin(
        formData.email,
        `${formData.first_name} ${formData.last_name}`,
        formData.phone,
        formData.position,
        formData.salutation,
        formData.password,
        formData.createDirectly
      );
      
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Failed to add admin:", error);
      // Error is handled in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSelectChange,
    handleCheckboxChange,
    handleSubmit,
    handleCancel,
    resetForm,
    validateForm,
    isFormValid
  };
};
