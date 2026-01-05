import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useTaskBulkOperations = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks-overview'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['project_tasks'] });
  };

  const bulkUpdateStatus = async (taskIds: string[], newStatus: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done' | 'archived' | 'deleted'): Promise<boolean> => {
    try {
      // Map status to database format
      const dbStatus = newStatus === 'in-progress' ? 'in_progress' : newStatus;
      
      const { error } = await supabase
        .from('project_tasks')
        .update({ status: dbStatus, updated_at: new Date().toISOString() })
        .in('id', taskIds);

      if (error) throw error;

      toast.success(`${taskIds.length} Aufgaben erfolgreich aktualisiert.`);
      invalidateQueries();
      return true;
    } catch (error) {
      console.error('Bulk status update error:', error);
      toast.error("Status konnte nicht aktualisiert werden.");
      return false;
    }
  };

  const bulkAssign = async (taskIds: string[], assigneeId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ assigned_to: assigneeId, updated_at: new Date().toISOString() })
        .in('id', taskIds);

      if (error) throw error;

      toast.success(`${taskIds.length} Aufgaben erfolgreich zugewiesen.`);
      invalidateQueries();
      return true;
    } catch (error) {
      console.error('Bulk assign error:', error);
      toast.error("Aufgaben konnten nicht zugewiesen werden.");
      return false;
    }
  };

  const bulkSetPriority = async (taskIds: string[], priority: 'high' | 'medium' | 'low'): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ priority, updated_at: new Date().toISOString() })
        .in('id', taskIds);

      if (error) throw error;

      toast.success(`${taskIds.length} Aufgaben-Prioritäten erfolgreich gesetzt.`);
      invalidateQueries();
      return true;
    } catch (error) {
      console.error('Bulk priority error:', error);
      toast.error("Prioritäten konnten nicht gesetzt werden.");
      return false;
    }
  };

  const bulkAddTags = async (taskIds: string[], tags: string[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ tags, updated_at: new Date().toISOString() })
        .in('id', taskIds);

      if (error) throw error;

      toast.success(`Tags zu ${taskIds.length} Aufgaben hinzugefügt.`);
      invalidateQueries();
      return true;
    } catch (error) {
      console.error('Bulk tags error:', error);
      toast.error("Tags konnten nicht hinzugefügt werden.");
      return false;
    }
  };

  const bulkArchive = async (taskIds: string[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .in('id', taskIds);

      if (error) throw error;

      toast.success(`${taskIds.length} Aufgaben erfolgreich archiviert.`);
      invalidateQueries();
      return true;
    } catch (error) {
      console.error('Bulk archive error:', error);
      toast.error("Aufgaben konnten nicht archiviert werden.");
      return false;
    }
  };

  const bulkDelete = async (taskIds: string[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .in('id', taskIds);

      if (error) throw error;

      toast.success(`${taskIds.length} Aufgaben erfolgreich gelöscht.`);
      invalidateQueries();
      return true;
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error("Aufgaben konnten nicht gelöscht werden.");
      return false;
    }
  };

  return {
    bulkUpdateStatus,
    bulkAssign,
    bulkSetPriority,
    bulkAddTags,
    bulkArchive,
    bulkDelete
  };
};
