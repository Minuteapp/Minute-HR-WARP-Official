
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';

/**
 * Hook für die Integration von Aufgaben-Deadlines in den Kalender
 */
export const useTaskDeadlineIntegration = () => {
  return useQuery({
    queryKey: ['task-deadline-calendar-events'],
    queryFn: async () => {
      // Aufgaben mit Fälligkeitsdatum abrufen
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id, title, description, due_date, priority, status')
        .not('due_date', 'is', null)
        .neq('status', 'done')
        .neq('status', 'archived')
        .neq('status', 'deleted');

      if (error) throw error;

      // Aufgaben in Kalenderereignisse umwandeln
      const taskDeadlineEvents: CalendarEvent[] = (tasks || []).map(task => {
        // Prioritäts-basierte Farbe bestimmen
        let color = 'blue';
        if (task.priority === 'high') color = 'red';
        else if (task.priority === 'medium') color = 'orange';

        const dueDate = new Date(task.due_date);
        
        return {
          id: `task-deadline-${task.id}`,
          title: `📋 ${task.title}`,
          description: `Aufgaben-Deadline: ${task.description || ''}`,
          start: dueDate.toISOString(),
          end: dueDate.toISOString(),
          type: 'deadline',
          color: color,
          metadata: {
            taskId: task.id,
            taskStatus: task.status,
            taskPriority: task.priority,
            isTaskDeadline: true
          }
        };
      });

      return taskDeadlineEvents;
    },
    refetchInterval: 5 * 60 * 1000, // Alle 5 Minuten aktualisieren
  });
};
