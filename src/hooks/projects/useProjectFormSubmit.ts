
import { toast } from "sonner";
import { ProjectFormData } from "./types";
import { createProject } from "./services/projectCreationService";
import { updateProject } from "./services/projectUpdateService";
import { saveAsTemplate } from "./services/projectTemplateService";
import { useAuth } from "@/contexts/AuthContext";

export const useProjectFormSubmit = (
  formData: ProjectFormData, 
  setIsSubmitting: (value: boolean) => void,
  mode: 'create' | 'edit',
  projectId?: string,
  onSuccess?: () => void
) => {
  const { user } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formular übermittelt mit Daten:", formData);
    
    // Validiere Pflichtfelder
    if (!formData.name || formData.name.trim() === '') {
      toast("Bitte geben Sie einen Projektnamen ein");
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        console.log("Starte Projekterstellung...");
        const result = await createProject(formData, user);
        console.log("Projekt erstellt:", result);
        
        if (formData.saveAsTemplate) {
          await saveAsTemplate(formData);
        }
        
        toast.success("Projekt erfolgreich erstellt");
        
        if (onSuccess) {
          onSuccess();
        }
      } else if (mode === 'edit' && projectId) {
        await updateProject(projectId, formData);
        
        toast.success("Projekt erfolgreich aktualisiert");
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('Fehler beim Speichern des Projekts:', error);
      toast.error(`Ein Fehler ist aufgetreten: ${error.message || 'Unbekannter Fehler'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit
  };
};
