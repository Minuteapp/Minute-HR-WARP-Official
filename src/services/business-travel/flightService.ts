
import { FlightDetails } from "@/types/business-travel";
import { supabase } from "@/integrations/supabase/client";

/**
 * Ruft Flugdetails für eine Geschäftsreise ab
 */
export const fetchFlightDetails = async (tripId: string): Promise<FlightDetails[]> => {
  try {
    const { data, error } = await supabase
      .from('flight_details')
      .select('*')
      .eq('business_trip_id', tripId)
      .order('departure_time', { ascending: true });

    if (error) {
      console.error('Error fetching flight details:', error);
      return [];
    }

    return data as FlightDetails[];
  } catch (error) {
    console.error('Error fetching flight details:', error);
    return [];
  }
};

/**
 * Erstellt neue Flugdetails
 */
export const createFlightDetails = async (tripId: string, flightData: Omit<FlightDetails, 'id' | 'business_trip_id' | 'created_at' | 'updated_at'>): Promise<FlightDetails | null> => {
  try {
    const { data, error } = await supabase
      .from('flight_details')
      .insert({
        business_trip_id: tripId,
        ...flightData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating flight details:', error);
      return null;
    }

    return data as FlightDetails;
  } catch (error) {
    console.error('Error creating flight details:', error);
    return null;
  }
};

/**
 * Aktualisiert Flugdetails
 */
export const updateFlightDetails = async (flightId: string, updates: Partial<FlightDetails>): Promise<FlightDetails | null> => {
  try {
    const { data, error } = await supabase
      .from('flight_details')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', flightId)
      .select()
      .single();

    if (error) {
      console.error('Error updating flight details:', error);
      return null;
    }

    return data as FlightDetails;
  } catch (error) {
    console.error('Error updating flight details:', error);
    return null;
  }
};

/**
 * Löscht Flugdetails
 */
export const deleteFlightDetails = async (flightId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('flight_details')
      .delete()
      .eq('id', flightId);

    if (error) {
      console.error('Error deleting flight details:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting flight details:', error);
    return false;
  }
};
