
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { TimeEntry } from '@/types/time-tracking.types';
import { aiTimeTrackingService } from '@/services/aiTimeTrackingService';

export interface AiSuggestion {
  id: string;
  type: 'project_assignment' | 'break_reminder' | 'time_optimization' | 'location_based';
  title: string;
  description: string;
  confidence: number;
  data: any;
  created_at: string;
  is_accepted?: boolean;
}

export interface ProjectSuggestion {
  project_id: string;
  project_name: string;
  confidence: number;
  reason: string;
  based_on: 'location' | 'time_pattern' | 'calendar' | 'previous_work';
}

export const useAiTimeTracking = (currentEntry?: TimeEntry | null) => {
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Lade aktuelle AI-Vorschläge
  const { data: activeSuggestions = [] } = useQuery({
    queryKey: ['ai-suggestions'],
    queryFn: aiTimeTrackingService.getActiveSuggestions,
    refetchInterval: 30000
  });

  // Generiere Projekt-Vorschläge basierend auf Kontext
  const generateProjectSuggestionsMutation = useMutation({
    mutationFn: ({ location, timeOfDay, dayOfWeek }: { 
      location?: string; 
      timeOfDay: number; 
      dayOfWeek: number;
    }) => aiTimeTrackingService.generateProjectSuggestions(location, timeOfDay, dayOfWeek),
    onSuccess: (suggestions) => {
      console.log('Project suggestions generated:', suggestions);
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions'] });
    }
  });

  // Akzeptiere oder lehne Vorschlag ab
  const handleSuggestionMutation = useMutation({
    mutationFn: ({ suggestionId, accepted }: { suggestionId: string; accepted: boolean }) =>
      aiTimeTrackingService.handleSuggestion(suggestionId, accepted),
    onSuccess: (_, { accepted }) => {
      toast({
        title: accepted ? "Vorschlag akzeptiert" : "Vorschlag abgelehnt",
        description: "Ihre Entscheidung wurde gespeichert und hilft beim Lernen."
      });
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions'] });
    }
  });

  // Analysiere aktuelle Situation für Smart Suggestions
  const analyzeCurrentSituation = async (location?: string, calendarEvents?: any[]) => {
    setIsAnalyzing(true);
    try {
      const now = new Date();
      const timeOfDay = now.getHours() + now.getMinutes() / 60;
      const dayOfWeek = now.getDay();

      await generateProjectSuggestionsMutation.mutateAsync({
        location,
        timeOfDay,
        dayOfWeek
      });

      // Generiere zusätzliche Kontextvorschläge
      const contextSuggestions = await aiTimeTrackingService.generateContextSuggestions(
        location,
        calendarEvents
      );

      setSuggestions(contextSuggestions);
    } catch (error) {
      console.error('Error analyzing situation:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Break-Erinnerungen überwachen
  useEffect(() => {
    if (!currentEntry) return;

    const checkBreakReminders = async () => {
      const workingTime = Date.now() - new Date(currentEntry.start_time).getTime();
      const hoursWorked = workingTime / (1000 * 60 * 60);

      if (hoursWorked >= 4 && hoursWorked < 4.1) {
        const suggestion: AiSuggestion = {
          id: Date.now().toString(),
          type: 'break_reminder',
          title: 'Pause empfohlen',
          description: 'Sie arbeiten bereits seit 4 Stunden. Eine Pause ist gesetzlich vorgeschrieben.',
          confidence: 95,
          data: { hoursWorked, required: true },
          created_at: new Date().toISOString()
        };

        setSuggestions(prev => [...prev, suggestion]);
        
        toast({
          title: "Pausenerinnerung",
          description: "Nach 4 Stunden Arbeitszeit ist eine Pause erforderlich.",
        });
      }
    };

    const interval = setInterval(checkBreakReminders, 60000); // Prüfe jede Minute
    return () => clearInterval(interval);
  }, [currentEntry, toast]);

  // Automatische Projektzuordnung
  const getAutomaticProjectSuggestion = async (location?: string): Promise<ProjectSuggestion | null> => {
    try {
      const now = new Date();
      const suggestions = await aiTimeTrackingService.generateProjectSuggestions(
        location,
        now.getHours() + now.getMinutes() / 60,
        now.getDay()
      );

      return suggestions.length > 0 ? suggestions[0] : null;
    } catch (error) {
      console.error('Error getting project suggestion:', error);
      return null;
    }
  };

  return {
    suggestions: [...activeSuggestions, ...suggestions],
    isAnalyzing,
    analyzeCurrentSituation,
    acceptSuggestion: (suggestionId: string) => 
      handleSuggestionMutation.mutate({ suggestionId, accepted: true }),
    rejectSuggestion: (suggestionId: string) => 
      handleSuggestionMutation.mutate({ suggestionId, accepted: false }),
    getAutomaticProjectSuggestion,
    isGeneratingProjectSuggestions: generateProjectSuggestionsMutation.isPending,
    isHandlingSuggestion: handleSuggestionMutation.isPending
  };
};
