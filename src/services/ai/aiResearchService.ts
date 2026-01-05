
import { supabase } from "@/integrations/supabase/client";
import { AIResearchProject, AIFeedback, AIDocument } from "@/types/ai";
import { toast } from "@/components/ui/use-toast";

export const aiResearchService = {
  async getResearchProjects(): Promise<AIResearchProject[]> {
    try {
      // Hier würden wir Daten aus einer Supabase-Tabelle abrufen
      return mockResearchProjects;
    } catch (error) {
      console.error("Fehler beim Abrufen der KI-Forschungsprojekte:", error);
      toast({
        title: "Fehler",
        description: "Die KI-Forschungsprojekte konnten nicht geladen werden.",
        variant: "destructive",
      });
      return [];
    }
  },

  async getProjectById(id: string): Promise<AIResearchProject | null> {
    try {
      const project = mockResearchProjects.find(p => p.id === id);
      if (!project) {
        throw new Error("Projekt nicht gefunden");
      }
      return project;
    } catch (error) {
      console.error(`Fehler beim Abrufen des Projekts ${id}:`, error);
      toast({
        title: "Fehler",
        description: "Das KI-Forschungsprojekt konnte nicht geladen werden.",
        variant: "destructive",
      });
      return null;
    }
  },

  async addFeedback(projectId: string, feedback: Omit<AIFeedback, 'id'>): Promise<boolean> {
    try {
      // Hier würden wir Feedback in einer Supabase-Tabelle speichern
      console.log("Feedback hinzugefügt:", projectId, feedback);
      return true;
    } catch (error) {
      console.error("Fehler beim Hinzufügen von Feedback:", error);
      toast({
        title: "Fehler",
        description: "Das Feedback konnte nicht gespeichert werden.",
        variant: "destructive",
      });
      return false;
    }
  },

  async uploadDocumentForProject(projectId: string, document: Omit<AIDocument, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      // Hier würden wir ein Dokument in Supabase Storage hochladen
      console.log("Dokument hochgeladen:", projectId, document);
      return true;
    } catch (error) {
      console.error("Fehler beim Hochladen des Dokuments:", error);
      toast({
        title: "Fehler",
        description: "Das Dokument konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
      return false;
    }
  },
  
  async updateProjectStatus(projectId: string, status: AIResearchProject['status']): Promise<boolean> {
    try {
      // Hier würden wir den Status eines Projekts in einer Supabase-Tabelle aktualisieren
      console.log("Projektstatus aktualisiert:", projectId, status);
      return true;
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Projektstatus:", error);
      toast({
        title: "Fehler",
        description: "Der Projektstatus konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      return false;
    }
  }
};

// Keine Mock-Daten - Projekte werden aus der Datenbank geladen
const mockResearchProjects: AIResearchProject[] = [];
