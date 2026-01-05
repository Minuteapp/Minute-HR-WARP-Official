
import { useCallback } from "react";
import { toast } from "sonner";

export const useProjectActions = (refreshProjects: () => Promise<void>) => {
  const handleDelete = useCallback(async (projectId: string) => {
    try {
      console.log("Lösche Projekt mit ID:", projectId);
      
      // Simuliere API-Anfrage mit einem Timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In einer echten Anwendung würde hier die API aufgerufen werden
      // await supabase.from("projects").delete().eq("id", projectId);
      
      await refreshProjects();
    } catch (error: any) {
      console.error("Fehler beim Löschen des Projekts:", error);
      toast.error(`Fehler beim Löschen: ${error.message}`);
      throw error;
    }
  }, [refreshProjects]);

  const moveToArchive = useCallback(async (projectId: string) => {
    try {
      console.log("Archiviere Projekt mit ID:", projectId);
      
      // Simuliere API-Anfrage mit einem Timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In einer echten Anwendung würde hier die API aufgerufen werden
      // await supabase.from("projects").update({ status: "archived" }).eq("id", projectId);
      
      await refreshProjects();
    } catch (error: any) {
      console.error("Fehler beim Archivieren des Projekts:", error);
      toast.error(`Fehler beim Archivieren: ${error.message}`);
      throw error;
    }
  }, [refreshProjects]);

  const moveToTrash = useCallback(async (projectId: string) => {
    try {
      console.log("Verschiebe Projekt in Papierkorb mit ID:", projectId);
      
      // Simuliere API-Anfrage mit einem Timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In einer echten Anwendung würde hier die API aufgerufen werden
      // await supabase.from("projects").update({ status: "trash" }).eq("id", projectId);
      
      await refreshProjects();
    } catch (error: any) {
      console.error("Fehler beim Verschieben des Projekts in den Papierkorb:", error);
      toast.error(`Fehler beim Verschieben in Papierkorb: ${error.message}`);
      throw error;
    }
  }, [refreshProjects]);

  const updateProjectStatus = useCallback(async (projectId: string, newStatus: string) => {
    try {
      console.log("Aktualisiere Projektstatus:", { projectId, newStatus });
      
      // Simuliere API-Anfrage mit einem Timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In einer echten Anwendung würde hier die API aufgerufen werden
      // await supabase.from("projects").update({ status: newStatus }).eq("id", projectId);
      
      toast.success(`Projektstatus aktualisiert: ${newStatus}`);
      await refreshProjects();
    } catch (error: any) {
      console.error("Fehler beim Aktualisieren des Projektstatus:", error);
      toast.error(`Fehler beim Aktualisieren des Status: ${error.message}`);
      throw error;
    }
  }, [refreshProjects]);

  return {
    handleDelete,
    moveToArchive,
    moveToTrash,
    updateProjectStatus
  };
};
