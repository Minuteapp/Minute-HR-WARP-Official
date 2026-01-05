
import { supabase } from '@/integrations/supabase/client';

export interface CrossModuleEvent {
  id: string;
  event_type: 'absence' | 'sick_leave' | 'shift_conflict';
  source_module: string;
  source_id: string;
  user_id: string;
  employee_name: string;
  department: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  status: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const crossModuleEventService = {
  // Alle Cross-Module-Events abrufen
  getEvents: async (): Promise<CrossModuleEvent[]> => {
    const { data, error } = await supabase
      .from('cross_module_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden der Cross-Module-Events:', error);
      throw error;
    }

    return data || [];
  },

  // Events für einen bestimmten Benutzer abrufen
  getUserEvents: async (userId: string): Promise<CrossModuleEvent[]> => {
    const { data, error } = await supabase
      .from('cross_module_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden der Benutzer-Events:', error);
      throw error;
    }

    return data || [];
  },

  // Events für einen Datumsbereich abrufen
  getEventsInDateRange: async (startDate: Date, endDate: Date): Promise<CrossModuleEvent[]> => {
    const { data, error } = await supabase
      .from('cross_module_events')
      .select('*')
      .gte('start_date', startDate.toISOString().split('T')[0])
      .lte('end_date', endDate.toISOString().split('T')[0])
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Fehler beim Laden der Events für Datumsbereich:', error);
      throw error;
    }

    return data || [];
  },

  // Schichtkonflikte abrufen
  getShiftConflicts: async (): Promise<CrossModuleEvent[]> => {
    const { data, error } = await supabase
      .from('cross_module_events')
      .select('*')
      .eq('event_type', 'shift_conflict')
      .eq('status', 'conflict')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden der Schichtkonflikte:', error);
      throw error;
    }

    return data || [];
  },

  // Event-Status aktualisieren
  updateEventStatus: async (eventId: string, status: string): Promise<void> => {
    const { error } = await supabase
      .from('cross_module_events')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId);

    if (error) {
      console.error('Fehler beim Aktualisieren des Event-Status:', error);
      throw error;
    }
  },

  // Ereignis als erledigt markieren
  resolveEvent: async (eventId: string, resolution: string): Promise<void> => {
    const { error } = await supabase
      .from('cross_module_events')
      .update({ 
        status: 'resolved',
        metadata: {
          resolution,
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId);

    if (error) {
      console.error('Fehler beim Auflösen des Events:', error);
      throw error;
    }
  }
};
