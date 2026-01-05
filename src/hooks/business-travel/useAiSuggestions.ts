
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TravelAiSuggestion } from '@/types/business-travel';
import { toast } from 'sonner';
import { 
  fetchAiSuggestions,
  updateAiSuggestion,
  generateAiSuggestions 
} from '@/services/business-travel/aiSuggestionsService';

export const useAiSuggestions = (tripId: string) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['ai-suggestions', tripId],
    queryFn: () => fetchAiSuggestions(tripId),
    enabled: !!tripId
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<TravelAiSuggestion> }) => 
      updateAiSuggestion(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions', tripId] });
    },
    onError: (error: any) => {
      console.error('Fehler beim Aktualisieren des Vorschlags:', error);
      toast.error('Fehler beim Aktualisieren des Vorschlags');
    }
  });

  const acceptSuggestion = async (suggestionId: string) => {
    try {
      await updateSuggestionMutation.mutateAsync({ 
        id: suggestionId, 
        updates: { is_accepted: true } 
      });
      toast.success('Vorschlag wurde akzeptiert');
      return true;
    } catch (error) {
      return false;
    }
  };

  const rejectSuggestion = async (suggestionId: string) => {
    try {
      await updateSuggestionMutation.mutateAsync({ 
        id: suggestionId, 
        updates: { is_accepted: false } 
      });
      toast.success('Vorschlag wurde abgelehnt');
      return true;
    } catch (error) {
      return false;
    }
  };

  const generateSuggestions = async (destination: string, purpose: string) => {
    try {
      setIsGenerating(true);
      const newSuggestions = await generateAiSuggestions(tripId, destination, purpose);
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions', tripId] });
      if (newSuggestions.length > 0) {
        toast.success(`${newSuggestions.length} neue Vorschläge generiert`);
      }
      return newSuggestions;
    } catch (error) {
      console.error('Fehler beim Generieren der Vorschläge:', error);
      toast.error('Fehler beim Generieren der Vorschläge');
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    suggestions,
    isLoadingSuggestions,
    isGenerating,
    acceptSuggestion,
    rejectSuggestion,
    generateSuggestions
  };
};
