
import { useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { Task } from '@/types/tasks';
import { convertEventToTask, convertTaskToEvent, syncTasksWithCalendar } from '@/services/calendarTaskIntegration';
import { useTasksStore } from '@/stores/useTasksStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook für die Verwaltung der Kalender-Aufgaben-Integration
 */
export function useCalendarTaskIntegration() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { addTask } = useTasksStore();
  
  /**
   * Synchronisiert Aufgaben mit dem Kalender
   */
  const syncWithCalendar = async (): Promise<boolean> => {
    setIsSyncing(true);
    try {
      // Aufrufen der Edge-Funktion zur Synchronisierung
      const { data, error } = await supabase.functions.invoke('sync-calendar-tasks', {
        body: { syncDirection: 'tasks-to-calendar' },
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success(`Kalender wurde aktualisiert: ${data.message}`);
      }
      
      return data?.success || false;
    } catch (error) {
      console.error('Fehler bei der Synchronisierung mit dem Kalender:', error);
      toast.error('Fehler bei der Synchronisierung mit dem Kalender');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };
  
  /**
   * Erstellt eine Aufgabe aus einem Kalenderereignis
   */
  const createTaskFromEvent = async (event: CalendarEvent): Promise<boolean> => {
    try {
      const partialTaskData = convertEventToTask(event);
      
      // Stelle sicher, dass alle erforderlichen Felder vorhanden sind
      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: partialTaskData.title || 'Unbenannte Aufgabe',
        description: partialTaskData.description,
        status: partialTaskData.status || 'todo',
        priority: partialTaskData.priority || 'medium',
        dueDate: partialTaskData.dueDate,
        reminderDate: partialTaskData.reminderDate,
        completed: partialTaskData.completed || false,
        assignedTo: partialTaskData.assignedTo || [],
        subtasks: partialTaskData.subtasks || [],
        tags: partialTaskData.tags || [],
        attachments: partialTaskData.attachments || [],
        comments: partialTaskData.comments || [],
        progress: partialTaskData.progress || 0,
        timeLogged: partialTaskData.timeLogged,
        dependencies: partialTaskData.dependencies || [],
        createdBy: partialTaskData.createdBy,
        history: partialTaskData.history || [],
        projectId: partialTaskData.projectId
      };
      
      const success = await addTask(taskData);
      
      if (success) {
        toast.success('Aufgabe aus Kalenderereignis erstellt');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Fehler beim Erstellen einer Aufgabe aus Kalenderereignis:', error);
      toast.error('Fehler beim Erstellen der Aufgabe');
      return false;
    }
  };
  
  /**
   * Importiert alle zukünftigen Kalenderereignisse als Aufgaben
   */
  const importEventsAsTasks = async (): Promise<boolean> => {
    setIsSyncing(true);
    try {
      // Aufrufen der Edge-Funktion zur Synchronisierung
      const { data, error } = await supabase.functions.invoke('sync-calendar-tasks', {
        body: { syncDirection: 'calendar-to-tasks' },
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success(`Aufgaben wurden importiert: ${data.message}`);
      }
      
      return data?.success || false;
    } catch (error) {
      console.error('Fehler beim Importieren von Kalenderereignissen:', error);
      toast.error('Fehler beim Importieren von Kalenderereignissen');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };
  
  return {
    isSyncing,
    syncWithCalendar,
    createTaskFromEvent,
    importEventsAsTasks
  };
}
