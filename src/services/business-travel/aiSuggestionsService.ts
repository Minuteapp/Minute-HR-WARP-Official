
import { TravelAiSuggestion } from "@/types/business-travel";
import { supabase } from "@/integrations/supabase/client";

/**
 * Ruft AI-Vorschläge für eine Geschäftsreise ab
 */
export const fetchAiSuggestions = async (tripId: string): Promise<TravelAiSuggestion[]> => {
  try {
    const { data, error } = await supabase
      .from('travel_ai_suggestions')
      .select('*')
      .eq('business_trip_id', tripId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching AI suggestions:', error);
      return [];
    }

    return data as TravelAiSuggestion[];
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    return [];
  }
};

/**
 * Erstellt neue AI-Vorschläge
 */
export const createAiSuggestion = async (tripId: string, suggestionData: Omit<TravelAiSuggestion, 'id' | 'business_trip_id' | 'created_at'>): Promise<TravelAiSuggestion | null> => {
  try {
    const { data, error } = await supabase
      .from('travel_ai_suggestions')
      .insert({
        business_trip_id: tripId,
        ...suggestionData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating AI suggestion:', error);
      return null;
    }

    return data as TravelAiSuggestion;
  } catch (error) {
    console.error('Error creating AI suggestion:', error);
    return null;
  }
};

/**
 * Aktualisiert AI-Vorschlag (z.B. als akzeptiert markieren)
 */
export const updateAiSuggestion = async (suggestionId: string, updates: Partial<TravelAiSuggestion>): Promise<TravelAiSuggestion | null> => {
  try {
    const { data, error } = await supabase
      .from('travel_ai_suggestions')
      .update(updates)
      .eq('id', suggestionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating AI suggestion:', error);
      return null;
    }

    return data as TravelAiSuggestion;
  } catch (error) {
    console.error('Error updating AI suggestion:', error);
    return null;
  }
};

/**
 * Generiert AI-Vorschläge für eine Geschäftsreise basierend auf Ziel und Zweck
 */
export const generateAiSuggestions = async (tripId: string, destination: string, purpose: string): Promise<TravelAiSuggestion[]> => {
  try {
    // Simuliere AI-Vorschläge basierend auf Ziel und Zweck
    const suggestions: Omit<TravelAiSuggestion, 'id' | 'business_trip_id' | 'created_at'>[] = [];

    // Hotel-Vorschläge
    suggestions.push({
      suggestion_type: 'hotel',
      title: `Business Hotel in ${destination}`,
      description: 'Zentral gelegenes Hotel mit Konferenzräumen',
      price: 120,
      currency: 'EUR',
      provider: 'Booking.com',
      rating: 4.2,
      url: 'https://booking.com/example',
      metadata: { amenities: ['wifi', 'breakfast', 'gym'] },
      is_accepted: false
    });

    // Flug-Vorschläge
    suggestions.push({
      suggestion_type: 'flight',
      title: `Direktflug nach ${destination}`,
      description: 'Günstigste verfügbare Option mit guter Timing',
      price: 180,
      currency: 'EUR',
      provider: 'Lufthansa',
      rating: 4.5,
      url: 'https://lufthansa.com/example',
      metadata: { duration: '2h 30m', stops: 0 },
      is_accepted: false
    });

    // Restaurant-Vorschläge basierend auf Zweck
    if (purpose.includes('kunde') || purpose.includes('meeting')) {
      suggestions.push({
        suggestion_type: 'restaurant',
        title: `Geschäftsrestaurant in ${destination}`,
        description: 'Gehobene Küche für Geschäftsessen',
        price: 45,
        currency: 'EUR',
        provider: 'OpenTable',
        rating: 4.7,
        url: 'https://opentable.com/example',
        metadata: { cuisine: 'international', dress_code: 'business' },
        is_accepted: false
      });
    }

    // Erstelle die Vorschläge in der Datenbank
    const createdSuggestions: TravelAiSuggestion[] = [];
    for (const suggestion of suggestions) {
      const created = await createAiSuggestion(tripId, suggestion);
      if (created) {
        createdSuggestions.push(created);
      }
    }

    return createdSuggestions;
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return [];
  }
};
