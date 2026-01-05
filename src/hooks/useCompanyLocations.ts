import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanyLocation {
  id: string;
  company_id: string;
  name: string;
  location_type: 'headquarters' | 'office' | 'branch' | 'remote';
  address: string;
  city: string;
  state_province?: string;
  postal_code?: string;
  country: string;
  timezone: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  contact_person_phone?: string;
  contact_person_email?: string;
  is_headquarters: boolean;
  employee_count: number;
  opening_hours?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LocationHoliday {
  id: string;
  location_id: string;
  name: string;
  date: string;
  is_public_holiday: boolean;
  is_company_holiday: boolean;
  is_recurring: boolean;
  category: string;
  description?: string;
  created_at: string;
}

export const useCompanyLocations = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [holidays, setHolidays] = useState<LocationHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_locations')
        .select('*')
        .order('is_headquarters', { ascending: false })
        .order('name');

      if (error) {
        throw error;
      }

      setLocations(data || []);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async (locationId?: string) => {
    try {
      let query = supabase
        .from('location_holidays')
        .select('*')
        .order('date');

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setHolidays(data || []);
    } catch (err) {
      console.error('Error fetching holidays:', err);
    }
  };

  const addLocation = async (locationData: Omit<CompanyLocation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('company_locations')
        .insert([locationData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setLocations(current => [...current, data]);
      
      toast({
        title: "Standort hinzugefügt",
        description: "Der neue Standort wurde erfolgreich erstellt.",
      });

      return data;
    } catch (err) {
      console.error('Error adding location:', err);
      toast({
        variant: "destructive",
        title: "Fehler beim Hinzufügen",
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      });
      throw err;
    }
  };

  const updateLocation = async (id: string, updates: Partial<CompanyLocation>) => {
    try {
      const { error } = await supabase
        .from('company_locations')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      setLocations(current => 
        current.map(location => 
          location.id === id ? { ...location, ...updates } : location
        )
      );
      
      toast({
        title: "Standort aktualisiert",
        description: "Die Standortdaten wurden erfolgreich gespeichert.",
      });
    } catch (err) {
      console.error('Error updating location:', err);
      toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      });
      throw err;
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('company_locations')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setLocations(current => current.filter(location => location.id !== id));
      
      toast({
        title: "Standort gelöscht",
        description: "Der Standort wurde erfolgreich entfernt.",
      });
    } catch (err) {
      console.error('Error deleting location:', err);
      toast({
        variant: "destructive",
        title: "Fehler beim Löschen",
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      });
      throw err;
    }
  };

  const addHoliday = async (holidayData: Omit<LocationHoliday, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('location_holidays')
        .insert([holidayData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setHolidays(current => [...current, data]);
      
      toast({
        title: "Feiertag hinzugefügt",
        description: "Der Feiertag wurde erfolgreich erstellt.",
      });

      return data;
    } catch (err) {
      console.error('Error adding holiday:', err);
      toast({
        variant: "destructive",
        title: "Fehler beim Hinzufügen",
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchHolidays();
  }, []);

  return {
    locations,
    holidays,
    loading,
    error,
    addLocation,
    updateLocation,
    deleteLocation,
    addHoliday,
    fetchHolidays,
    refetch: fetchLocations
  };
};