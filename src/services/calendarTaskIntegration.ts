
import { CalendarEvent } from '@/types/calendar';
import { Task } from '@/types/tasks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Wandelt ein Kalenderereignis in eine Aufgabe um
 */
export const convertEventToTask = (event: CalendarEvent): Partial<Task> => {
  // Bestimme den passenden Status basierend auf dem Datum
  const now = new Date();
  const eventStart = new Date(event.start);
  const isOverdue = eventStart < now;
  
  // Erstelle eine neue Aufgabe basierend auf dem Kalenderereignis
  return {
    title: event.title,
    description: event.description || `Kalenderereignis: ${event.title}`,
    status: isOverdue ? 'blocked' : 'todo',
    priority: 'medium',
    dueDate: event.end ? new Date(event.end).toISOString() : undefined,
    reminderDate: event.start ? new Date(event.start).toISOString() : undefined,
    tags: event.type ? [event.type] : [],
  };
};

/**
 * Wandelt eine Aufgabe mit Fälligkeitsdatum in ein Kalenderereignis um
 */
export const convertTaskToEvent = (task: Task): Partial<CalendarEvent> => {
  // Bestimme die Farbe basierend auf der Priorität der Aufgabe
  let color;
  switch(task.priority) {
    case 'high': color = 'red'; break;
    case 'medium': color = 'orange'; break;
    case 'low': color = 'blue'; break;
    default: color = 'blue';
  }

  // Erstelle das Kalenderereignis basierend auf der Aufgabe
  const event: Partial<CalendarEvent> = {
    title: `[Aufgabe] ${task.title}`,
    description: task.description,
    type: 'task',
    color: color,
  };
  
  // Fälligkeitsdatum als Endzeit des Events verwenden, wenn vorhanden
  if (task.dueDate) {
    event.end = new Date(task.dueDate).toISOString();
    
    // Wenn kein expliziter Startzeitpunkt existiert, eine Stunde vor dem Fälligkeitsdatum verwenden
    const startDate = task.reminderDate 
      ? new Date(task.reminderDate) 
      : new Date(new Date(task.dueDate).getTime() - (60 * 60 * 1000)); // 1 Stunde vorher
      
    event.start = startDate.toISOString();
  }
  
  return event;
};

/**
 * Synchronisiert Aufgaben mit dem Kalender
 */
export const syncTasksWithCalendar = async (): Promise<boolean> => {
  try {
    // 1. Aufgaben mit Fälligkeitsdatum abrufen
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .not('dueDate', 'is', null);
      
    if (tasksError) throw tasksError;
    
    // 2. Vorhandene Aufgaben-Events im Kalender abrufen
    const { data: existingEvents, error: eventsError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('type', 'task');
      
    if (eventsError) throw eventsError;
    
    // 3. Neue Aufgaben als Kalenderereignisse hinzufügen
    const existingTaskIds = existingEvents.map(event => 
      event.description?.match(/\[Task ID: (.*?)\]/)?.[1] || '');
      
    const tasksToAdd = tasks.filter(task => 
      !existingTaskIds.includes(task.id) && task.dueDate);
      
    if (tasksToAdd.length > 0) {
      // Kalenderereignisse für neue Aufgaben erstellen
      const newEvents = tasksToAdd.map(task => {
        const event = convertTaskToEvent(task);
        // Task-ID im Beschreibungstext speichern, um später die Zuordnung zu ermöglichen
        event.description = `${event.description || ''}\n\n[Task ID: ${task.id}]`;
        return event;
      });
      
      const { error: insertError } = await supabase
        .from('calendar_events')
        .insert(newEvents);
        
      if (insertError) throw insertError;
    }
    
    toast.success("Aufgaben wurden erfolgreich mit dem Kalender synchronisiert");
    return true;
  } catch (error) {
    console.error('Fehler bei der Kalender-Synchronisation:', error);
    toast.error("Fehler bei der Synchronisation mit dem Kalender");
    return false;
  }
};
