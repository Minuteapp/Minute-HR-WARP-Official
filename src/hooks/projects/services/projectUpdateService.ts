
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectFormData } from "../types";

export const updateProject = async (projectId: string, formData: ProjectFormData) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Benutzer nicht authentifiziert");
    }
    
    // Convert budget string to number if present
    let budget: number | null = null;
    if (formData.budget) {
      if (typeof formData.budget === 'string') {
        const parsedBudget = parseFloat(formData.budget);
        budget = isNaN(parsedBudget) ? null : parsedBudget;
      } else {
        budget = formData.budget;
      }
    }
    
    // Handle empty dates - use null instead of empty strings
    const startDate = formData.startDate && formData.startDate.trim() !== '' ? formData.startDate : null;
    const endDate = formData.dueDate && formData.dueDate.trim() !== '' ? formData.dueDate : null;
    
    // Gültige Status-Werte, die vom Backend akzeptiert werden
    const validStatuses = ['pending', 'active', 'completed', 'review', 'blocked', 'archived'];
    
    // Verwenden Sie den Status aus den Formulardaten oder Standard
    let status = 'pending';
    
    // Wenn ein Status in den Formulardaten vorhanden ist, prüfen Sie, ob er gültig ist
    if (formData.status) {
      if (validStatuses.includes(formData.status)) {
        status = formData.status;
      } else {
        console.warn(`Ungültiger Status: ${formData.status}, verwende Default: ${status}`);
      }
    }
    
    console.log("Aktualisiere Projekt mit Status:", status);
    
    // Update project
    const { data: project, error } = await supabase
      .from('projects')
      .update({
        name: formData.name,
        description: formData.description || '',
        start_date: startDate,
        end_date: endDate,
        status: status,
        priority: formData.priority || 'medium',
        budget: budget,
        category: formData.category || '',
        team_members: formData.team ? formData.team.map(member => member.id) : []
      })
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Handle tasks if needed
    if (formData.tasks && formData.tasks.length > 0) {
      // First delete existing tasks
      const { error: deleteError } = await supabase
        .from('project_tasks')
        .delete()
        .eq('project_id', projectId);
        
      if (deleteError) {
        console.error("Fehler beim Löschen bestehender Aufgaben:", deleteError);
      }
      
      // Then insert new tasks
      const tasksToInsert = formData.tasks.map(task => ({
        title: task.title || 'Neue Aufgabe',
        description: task.description || '',
        due_date: task.dueDate && task.dueDate.trim() !== '' ? task.dueDate : null,
        priority: task.priority || 'medium',
        status: 'todo',
        project_id: projectId,
        assigned_to: task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo[0] : null
      }));
      
      const { error: tasksError } = await supabase
        .from('project_tasks')
        .insert(tasksToInsert);
      
      if (tasksError) {
        console.error("Fehler beim Aktualisieren der Aufgaben:", tasksError);
        toast("Projekt wurde aktualisiert, aber Aufgaben konnten nicht aktualisiert werden");
      }
    }
    
    console.log("Project updated successfully:", project);
    return project;
    
  } catch (error: any) {
    console.error("Fehler beim Aktualisieren des Projekts:", error);
    toast(`Fehler beim Aktualisieren des Projekts: ${error.message || 'Unbekannter Fehler'}`);
    throw error;
  }
};
