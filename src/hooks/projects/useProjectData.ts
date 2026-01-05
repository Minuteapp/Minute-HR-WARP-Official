
import { useState, useCallback, useEffect } from "react";
import { Project } from "@/types/project";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useProjectData = (statusFilter: string, priorityFilter: string, showArchivedOrTrash: boolean) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      console.log("Projekte laden mit Filtern:", { statusFilter, priorityFilter, showArchivedOrTrash });
      setLoading(true);
      
      // Daten aus Supabase laden
      let query = supabase.from('projects').select('*');
      
      // Filter anwenden
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }
      
      if (priorityFilter !== "all") {
        query = query.eq('priority', priorityFilter);
      }
      
      if (!showArchivedOrTrash) {
        query = query.neq('status', 'archived');
      }
      
      // Sortierung hinzufügen
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Daten transformieren um sicherzustellen, dass sie dem Project-Interface entsprechen
      const transformedProjects: Project[] = data?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        status: item.status || 'pending',
        priority: item.priority || 'medium',
        startDate: item.start_date || '',
        dueDate: item.end_date || '',
        progress: item.progress || 0,
        responsiblePerson: item.owner_id || '',
        category: item.category || '',
        createdAt: item.created_at || new Date().toISOString()
      })) || [];

      setProjects(transformedProjects);
      console.log("Geladene Projekte:", transformedProjects);
    } catch (error: any) {
      toast.error(`Fehler beim Laden der Projekte: ${error.message}`);
      console.error("Error fetching projects:", error);
      // Wenn ein Fehler auftritt, leere Liste anzeigen - keine Beispieldaten mehr
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, showArchivedOrTrash]);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    setProjects,
    loading,
    fetchProjects
  };
};
