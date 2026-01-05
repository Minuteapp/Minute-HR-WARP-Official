
import { ProjectFormData } from "./types";

export const useProjectFormValidation = (formData: ProjectFormData) => {
  const validateBasicInfo = () => {
    if (!formData.name || formData.name.trim() === '') {
      return false;
    }
    
    if (!formData.status) {
      return false;
    }
    
    return true;
  };
  
  const validateTimeline = () => {
    // Wenn beide Daten gesetzt sind, überprüfe, dass das Startdatum vor dem Enddatum liegt
    if (formData.startDate && formData.dueDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.dueDate);
      if (start > end) {
        return false;
      }
    }
    return true;
  };

  const isFormValid = () => {
    // Überprüfe Pflichtfelder
    if (!validateBasicInfo()) {
      return false;
    }
    
    // Überprüfe Timeline
    if (!validateTimeline()) {
      return false;
    }
    
    return true;
  };

  return { isFormValid };
};
