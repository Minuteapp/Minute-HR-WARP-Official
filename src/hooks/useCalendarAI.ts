import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { toast } from 'sonner';

interface AIAssistantRequest {
  prompt: string;
  events: CalendarEvent[];
  context?: {
    currentDate: string;
    userPreferences?: Record<string, any>;
  };
}

interface AIAssistantResponse {
  response: string;
  suggestions?: any[];
  actions?: any[];
}

export const useCalendarAI = () => {
  const callAIAssistant = useMutation({
    mutationFn: async (request: AIAssistantRequest): Promise<AIAssistantResponse> => {
      console.log('Calling calendar AI assistant:', request);
      
      const { data, error } = await supabase.functions.invoke('calendar-ai-assistant', {
        body: {
          prompt: request.prompt,
          events: request.events,
          context: request.context || {}
        }
      });

      if (error) {
        console.error('Error calling AI assistant:', error);
        throw new Error(error.message || 'Fehler beim Aufrufen des KI-Assistenten');
      }

      return data;
    },
    onError: (error) => {
      console.error('AI Assistant error:', error);
      toast.error('Fehler beim KI-Assistenten: ' + error.message);
    }
  });

  return {
    callAIAssistant,
    isLoading: callAIAssistant.isPending
  };
};