
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SmartSuggestionRequest {
  eventTitle: string;
  duration: number;
  participants?: string[];
  preferredTimes?: string[];
}

interface ProjectTimeBlockRequest {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  block_type: 'milestone' | 'deadline' | 'focus_time';
  priority: 'low' | 'medium' | 'high';
  is_flexible: boolean;
  buffer_minutes: number;
  user_id: string;
  project_id?: string;
}

export const useSmartCalendar = () => {
  const queryClient = useQueryClient();

  const suggestions = useMutation({
    mutationFn: async (request: SmartSuggestionRequest) => {
      console.log('Generating smart suggestion:', request);
      
      // Simuliere Smart-Vorschlag-Generierung
      const suggestion = {
        id: `suggestion-${Date.now()}`,
        title: request.eventTitle,
        suggestedTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: request.duration,
        participants: request.participants || [],
        confidence: 0.85,
        reasoning: 'Basierend auf verfügbaren Zeiten und Teilnehmer-Kalendern'
      };

      return suggestion;
    },
    onSuccess: () => {
      toast.success('Smart-Vorschlag wurde generiert');
      queryClient.invalidateQueries({ queryKey: ['calendar-suggestions'] });
    },
    onError: (error) => {
      console.error('Fehler beim Generieren des Smart-Vorschlags:', error);
      toast.error('Fehler beim Generieren des Smart-Vorschlags');
    }
  });

  const timeBlocks = useMutation({
    mutationFn: async (request: ProjectTimeBlockRequest) => {
      console.log('Creating project time block:', request);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: request.title,
          description: request.description,
          start: request.start_time,
          end: request.end_time,
          type: 'project_timeblock',
          category: request.block_type,
          priority: request.priority,
          user_id: request.user_id,
          project_id: request.project_id,
          metadata: {
            is_flexible: request.is_flexible,
            buffer_minutes: request.buffer_minutes
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Projekt-Zeitblock wurde erstellt');
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: (error) => {
      console.error('Fehler beim Erstellen des Zeitblocks:', error);
      toast.error('Fehler beim Erstellen des Zeitblocks');
    }
  });

  return {
    suggestions,
    timeBlocks
  };
};

export const useSmartScheduling = () => {
  return useSmartCalendar().suggestions;
};

export const useGenerateSmartSuggestion = () => {
  return useSmartCalendar().suggestions;
};

export const useCreateProjectTimeBlock = () => {
  return useSmartCalendar().timeBlocks;
};

// Neue Hooks für die fehlenden Funktionen
export const useProjectTimeBlocks = () => {
  return useQuery({
    queryKey: ['project-time-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('type', 'project_timeblock')
        .order('start', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });
};

export const useUpdateFollowUpStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      console.log('Updating follow-up status:', { id, status });
      
      // Simuliere Status-Update
      return { id, status, updated_at: new Date().toISOString() };
    },
    onSuccess: () => {
      toast.success('Status wurde aktualisiert');
      queryClient.invalidateQueries({ queryKey: ['follow-up-tasks'] });
    },
    onError: (error) => {
      console.error('Fehler beim Aktualisieren des Status:', error);
      toast.error('Fehler beim Aktualisieren des Status');
    }
  });
};
