import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from '@/types/tasks';

export const fetchTasksFromApi = async () => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    toast.error('Fehler beim Laden der Aufgaben');
    throw error;
  }
};

export const addTaskToApi = async (taskData: any) => {
  try {
    console.log('Adding task with data:', taskData);
    
    // Hole die effektive company_id für Tenant-Modus
    const { data: companyId } = await supabase.rpc('get_effective_company_id');
    console.log('Effective company_id für Task:', companyId);
    
    const cleanedData: Record<string, any> = {};
    
    // Setze company_id
    if (companyId) {
      cleanedData.company_id = companyId;
    }
    
    // Grundlegende Felder kopieren
    if (taskData.title) cleanedData.title = taskData.title;
    if (taskData.description !== undefined) cleanedData.description = taskData.description;
    
    // Status und Priorität validieren
    const validStatuses = ['todo', 'in-progress', 'review', 'blocked', 'done'];
    cleanedData.status = validStatuses.includes(taskData.status) ? taskData.status : 'todo';
    
    const validPriorities = ['high', 'medium', 'low'];
    cleanedData.priority = validPriorities.includes(taskData.priority) ? taskData.priority : 'medium';
    
    // Projekt ID
    if (taskData.projectId) cleanedData.project_id = taskData.projectId;
    
    // Erledigt-Status
    if (taskData.completed !== undefined) cleanedData.completed = Boolean(taskData.completed);
    
    // Fortschritt
    if (typeof taskData.progress === 'number') cleanedData.progress = taskData.progress;
    
    // Fälligkeitsdatum mit Zeitinformation erhalten
    if (taskData.dueDate) {
      cleanedData.due_date = taskData.dueDate;
    }

    // Erinnerungsdatum mit Zeitinformation erhalten
    if (taskData.reminderDate) {
      cleanedData.reminder_date = taskData.reminderDate;
    }
    
    // Zugewiesene Benutzer - als Array speichern
    if (taskData.assignedTo && Array.isArray(taskData.assignedTo) && taskData.assignedTo.length > 0) {
      cleanedData.assigned_to = taskData.assignedTo;
      // Stelle sicher, dass alle IDs im UUID-Format sind
      console.log('Team members being assigned:', cleanedData.assigned_to);
      
      if (!cleanedData.assigned_to.every((id: string) => 
        typeof id === 'string' && 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      )) {
        console.error('Invalid UUID format detected in assigned_to:', cleanedData.assigned_to);
      }
    } else if (typeof taskData.assignedTo === 'string') {
      cleanedData.assigned_to = [taskData.assignedTo];
    }
    
    // Subtasks und andere komplexe Datentypen
    if (taskData.subtasks && Array.isArray(taskData.subtasks) && taskData.subtasks.length > 0) {
      cleanedData.subtasks = taskData.subtasks;
    }
    
    if (taskData.tags && Array.isArray(taskData.tags) && taskData.tags.length > 0) {
      cleanedData.tags = taskData.tags;
    }
    
    if (taskData.attachments && Array.isArray(taskData.attachments) && taskData.attachments.length > 0) {
      // Eigentlich würden hier die Dateien hochgeladen werden, aber für unsere Demo
      // speichern wir nur die Metadaten
      console.log('Speichere Anhänge-Metadata:', taskData.attachments);
      cleanedData.attachments = taskData.attachments;
    }
    
    if (taskData.notes) {
      cleanedData.notes = taskData.notes;
    }
    
    // Erstellt von (wenn verfügbar)
    if (taskData.created_by) {
      cleanedData.created_by = taskData.created_by;
    }
    
    console.log('Bereinigte Daten für API:', cleanedData);
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([cleanedData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error adding task:', error);
      throw error;
    }
    
    console.log('Successfully added task:', data);
    return data;
  } catch (error) {
    console.error('Error adding task:', error);
    toast.error('Fehler beim Erstellen der Aufgabe');
    throw error;
  }
};

export const updateTaskInApi = async (taskId: string, updateData: any) => {
  try {
    console.log('Updating task with data:', updateData);
    
    // Validiere und bereinige die Daten vor dem Speichern
    const cleanedData: Record<string, any> = {};
    
    // Grundlegende Felder kopieren
    if (updateData.title !== undefined) cleanedData.title = updateData.title;
    if (updateData.description !== undefined) cleanedData.description = updateData.description;
    
    // Status validieren
    if (updateData.status !== undefined) {
      const validStatuses = ['todo', 'in-progress', 'review', 'blocked', 'done', 'archived', 'deleted'];
      cleanedData.status = validStatuses.includes(updateData.status) ? updateData.status : 'todo';
    }
    
    // Priorität validieren
    if (updateData.priority !== undefined) {
      const validPriorities = ['high', 'medium', 'low'];
      cleanedData.priority = validPriorities.includes(updateData.priority) ? updateData.priority : 'medium';
    }
    
    // Erledigt-Status
    if (updateData.completed !== undefined) cleanedData.completed = Boolean(updateData.completed);
    
    // Fortschritt
    if (typeof updateData.progress === 'number') cleanedData.progress = updateData.progress;
    
    // Fälligkeitsdatum mit Zeitinformation
    if (updateData.due_date !== undefined) cleanedData.due_date = updateData.due_date;
    else if (updateData.dueDate !== undefined) cleanedData.due_date = updateData.dueDate;

    // Erinnerungsdatum mit Zeitinformation
    if (updateData.reminder_date !== undefined) cleanedData.reminder_date = updateData.reminder_date;
    else if (updateData.reminderDate !== undefined) cleanedData.reminder_date = updateData.reminderDate;
    
    // Zugewiesene Benutzer - als Array in der Datenbank speichern
    if (updateData.assigned_to !== undefined) {
      if (Array.isArray(updateData.assigned_to)) {
        cleanedData.assigned_to = updateData.assigned_to;
        console.log('Team members for update:', cleanedData.assigned_to);
      } else if (typeof updateData.assigned_to === 'string') {
        cleanedData.assigned_to = [updateData.assigned_to];
      }
    } else if (updateData.assignedTo !== undefined) {
      if (Array.isArray(updateData.assignedTo)) {
        cleanedData.assigned_to = updateData.assignedTo;
        console.log('Team members (assignedTo) for update:', cleanedData.assigned_to);
      } else if (typeof updateData.assignedTo === 'string') {
        cleanedData.assigned_to = [updateData.assignedTo];
      }
    }
    
    // Weitere Felder
    if (updateData.subtasks !== undefined) cleanedData.subtasks = updateData.subtasks;
    if (updateData.tags !== undefined) cleanedData.tags = updateData.tags;
    if (updateData.comments !== undefined) cleanedData.comments = updateData.comments;
    if (updateData.attachments !== undefined) {
      console.log('Aktualisiere Anhänge:', updateData.attachments);
      cleanedData.attachments = updateData.attachments;
    }
    
    // Projekt-ID
    if (updateData.project_id !== undefined) cleanedData.project_id = updateData.project_id;
    else if (updateData.projectId !== undefined) cleanedData.project_id = updateData.projectId;
    
    console.log('Bereinigte Update-Daten für API:', cleanedData);
    
    const { data, error } = await supabase
      .from('tasks')
      .update(cleanedData)
      .eq('id', taskId)
      .select();

    if (error) {
      console.error('Supabase error updating task:', error);
      throw error;
    }
    
    console.log('Task updated successfully:', taskId);
    return data ? data[0] : null;
  } catch (error) {
    console.error('Error updating task:', error);
    toast.error('Fehler beim Aktualisieren der Aufgabe');
    throw error;
  }
};

export const deleteTaskFromApi = async (taskId: string) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    toast.error('Fehler beim Löschen der Aufgabe');
    throw error;
  }
};

export const batchUpdateTasksInApi = async (taskIds: string[], updateData: any) => {
  try {
    console.log('Batch updating tasks with IDs:', taskIds);
    console.log('Update data:', updateData);
    
    // Validiere und bereinige die Daten vor dem Speichern
    const cleanedData: Record<string, any> = {};
    
    // Grundlegende Felder kopieren
    if (updateData.title !== undefined) cleanedData.title = updateData.title;
    if (updateData.description !== undefined) cleanedData.description = updateData.description;
    
    // Status validieren
    if (updateData.status !== undefined) {
      const validStatuses = ['todo', 'in-progress', 'review', 'blocked', 'done', 'archived', 'deleted'];
      cleanedData.status = validStatuses.includes(updateData.status) ? updateData.status : 'todo';
    }
    
    // Priorität validieren
    if (updateData.priority !== undefined) {
      const validPriorities = ['high', 'medium', 'low'];
      cleanedData.priority = validPriorities.includes(updateData.priority) ? updateData.priority : 'medium';
    }
    
    // Erledigt-Status
    if (updateData.completed !== undefined) cleanedData.completed = Boolean(updateData.completed);
    
    // Fortschritt
    if (typeof updateData.progress === 'number') cleanedData.progress = updateData.progress;
    
    // Fälligkeitsdatum
    if (updateData.due_date !== undefined) cleanedData.due_date = updateData.due_date;
    else if (updateData.dueDate !== undefined) cleanedData.due_date = updateData.dueDate;

    // Erinnerungsdatum
    if (updateData.reminder_date !== undefined) cleanedData.reminder_date = updateData.reminder_date;
    else if (updateData.reminderDate !== undefined) cleanedData.reminder_date = updateData.reminderDate;
    
    // Aktualisierungsdatum für alle Aufgaben setzen
    cleanedData.updated_at = new Date().toISOString();
    
    // Batch-Update über Supabase durchführen
    const { data, error } = await supabase
      .from('tasks')
      .update(cleanedData)
      .in('id', taskIds);

    if (error) {
      console.error('Supabase error batch updating tasks:', error);
      throw error;
    }
    
    console.log('Tasks batch updated successfully:', taskIds);
    return true;
  } catch (error) {
    console.error('Error batch updating tasks:', error);
    toast.error('Fehler bei der Massenaktualisierung von Aufgaben');
    throw error;
  }
};

export const batchDeleteTasksInApi = async (taskIds: string[]) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .in('id', taskIds);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error batch deleting tasks:', error);
    toast.error('Fehler beim Massenlöschen von Aufgaben');
    throw error;
  }
};
