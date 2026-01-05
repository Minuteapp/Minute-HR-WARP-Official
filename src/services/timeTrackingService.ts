
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/time-tracking.types';

// Helper-Funktion um die company_id des aktuellen Benutzers zu holen
async function getEffectiveCompanyId(userId: string): Promise<string | null> {
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('company_id')
    .eq('user_id', userId)
    .maybeSingle();
  
  return userRole?.company_id || null;
}

export interface TimeTrackingData {
  project?: string;
  location: string;
  note?: string;
  office_location_id?: string;
  user_id: string;
  start_time?: string;
}

export interface ManualTimeEntryData {
  start_time: string;
  end_time: string;
  project?: string;
  location: string;
  note?: string;
  office_location_id?: string;
  user_id: string;
}

export interface NewTimeEntry {
  project?: string;
  location: string;
  note?: string;
  start_time: string;
  end_time?: string;
  office_location_id?: string;
  user_id: string;
}

export const timeTrackingService = {
  async startTimeTracking(data: TimeTrackingData): Promise<TimeEntry> {
    console.log('🚀 startTimeTracking called for user:', data.user_id);
    
    // Bereinige zuerst verwaiste aktive Einträge
    await timeTrackingService.cleanupOrphanedEntries(data.user_id);
    
    // Prüfe erneut, ob bereits ein aktiver Eintrag existiert
    const activeEntry = await timeTrackingService.getActiveTimeEntryForUser(data.user_id);
    if (activeEntry) {
      console.log('⚠️ Active entry already exists:', activeEntry.id);
      // Gib die bereits aktive Zeiterfassung zurück anstatt einen Fehler zu werfen
      return activeEntry;
    }

    // Hole die company_id des Benutzers
    const companyId = await getEffectiveCompanyId(data.user_id);

    // Validiere location Wert
    const validLocations = ['office', 'home', 'mobile'];
    const safeLocation = validLocations.includes(data.location) ? data.location : 'office';

    console.log('✅ No active entry found, creating new one with company_id:', companyId, 'location:', safeLocation);
    const { data: entry, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: data.user_id,
        start_time: data.start_time || new Date().toISOString(),
        status: 'active',
        project: data.project || 'none',
        location: safeLocation,
        note: data.note,
        office_location_id: data.office_location_id,
        company_id: companyId,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ Error creating time entry:', error);
      throw error;
    }
    if (!entry) throw new Error('Zeiterfassung konnte nicht gestartet werden');
    
    console.log('✅ New time entry created:', entry.id);
    return entry;
  },

  async endTimeTracking(timeEntryId: string): Promise<TimeEntry> {
    const { data: entry, error } = await supabase
      .from('time_entries')
      .update({
        end_time: new Date().toISOString(),
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', timeEntryId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!entry) throw new Error('Zeiterfassung konnte nicht beendet werden');
    return entry;
  },

  async createManualTimeEntry(data: ManualTimeEntryData): Promise<TimeEntry> {
    // Hole die company_id des Benutzers
    const companyId = await getEffectiveCompanyId(data.user_id);

    // Validiere location Wert
    const validLocations = ['office', 'home', 'mobile'];
    const safeLocation = validLocations.includes(data.location) ? data.location : 'office';

    const { data: entry, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: data.user_id,
        start_time: data.start_time,
        end_time: data.end_time,
        status: 'completed',
        project: data.project || 'none',
        location: safeLocation,
        note: data.note,
        office_location_id: data.office_location_id,
        company_id: companyId,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!entry) throw new Error('Manueller Zeiteintrag konnte nicht erstellt werden');
    return entry;
  },

  async updateTimeEntry(timeEntryId: string, data: Partial<NewTimeEntry>): Promise<TimeEntry> {
    const { data: entry, error } = await supabase
      .from('time_entries')
      .update({
        project: data.project,
        location: data.location,
        note: data.note,
        office_location_id: data.office_location_id,
        end_time: data.end_time,
        updated_at: new Date().toISOString(),
      })
      .eq('id', timeEntryId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!entry) throw new Error('Zeiteintrag konnte nicht aktualisiert werden');
    return entry;
  },

  async updateTimeEntryStatus(timeEntryId: string, status: string, breakMinutes?: number, pausedWorkSeconds?: number): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (breakMinutes !== undefined) {
      updateData.break_minutes = breakMinutes;
    }

    if (pausedWorkSeconds !== undefined) {
      updateData.paused_work_seconds = pausedWorkSeconds;
    }

    const { error } = await supabase
      .from('time_entries')
      .update(updateData)
      .eq('id', timeEntryId);

    if (error) throw error;
  },

  // Neue Funktion für Live-Updates von Projekt, Aufgabe, Kostenstelle und Ort während der Zeiterfassung
  async updateActiveTimeEntry(timeEntryId: string, updates: { 
    project?: string; 
    task?: string;
    department?: string;
    location?: string; 
    office_location_id?: string; 
    note?: string 
  }): Promise<TimeEntry> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Nur definierte Werte übernehmen
    if (updates.project !== undefined) updateData.project = updates.project;
    if (updates.task !== undefined) updateData.note = updates.task; // Task wird als note gespeichert
    if (updates.department !== undefined) updateData.department = updates.department;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.office_location_id !== undefined) updateData.office_location_id = updates.office_location_id;
    if (updates.note !== undefined && updates.task === undefined) updateData.note = updates.note;

    const { data: entry, error } = await supabase
      .from('time_entries')
      .update(updateData)
      .eq('id', timeEntryId)
      .in('status', ['active', 'paused']) // Auch pausierte Einträge können aktualisiert werden
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!entry) throw new Error('Aktiver Zeiteintrag konnte nicht aktualisiert werden');
    return entry;
  },

  async stopTimeTracking(timeEntryId: string): Promise<TimeEntry> {
    const { data: entry, error } = await supabase
      .from('time_entries')
      .update({
        end_time: new Date().toISOString(),
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', timeEntryId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!entry) throw new Error('Zeiterfassung konnte nicht gestoppt werden');
    return entry;
  },

  async getActiveTimeEntry(): Promise<TimeEntry | null> {
    // Diese Funktion sollte nicht mehr verwendet werden - use getActiveTimeEntryForUser instead
    console.warn('getActiveTimeEntry() is deprecated, use getActiveTimeEntryForUser() instead');
    
    // Für Kompatibilität: Versuche die aktuelle User-ID zu ermitteln
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error in getActiveTimeEntry:', authError);
        return null;
      }
      if (user?.id) {
        return timeTrackingService.getActiveTimeEntryForUser(user.id);
      }
    } catch (error) {
      console.error('Error getting current user for deprecated getActiveTimeEntry:', error);
      return null;
    }
    
    return null;
  },

  async getActiveTimeEntryForUser(userId: string): Promise<TimeEntry | null> {
    const { data: entries, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'paused']) // Auch pausierte Einträge sind "aktiv"
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1);

    if (error) throw error;
    return entries?.[0] || null;
  },

  async pauseTimeTracking(timeEntryId: string, currentElapsedSeconds: number): Promise<void> {
    const { error } = await supabase
      .from('time_entries')
      .update({
        status: 'paused',
        paused_work_seconds: currentElapsedSeconds,
        updated_at: new Date().toISOString(),
      })
      .eq('id', timeEntryId);

    if (error) throw error;
  },

  async resumeTimeTracking(timeEntryId: string, totalBreakMinutes: number): Promise<void> {
    const { error } = await supabase
      .from('time_entries')
      .update({
        status: 'active',
        paused_work_seconds: 0,
        break_minutes: totalBreakMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', timeEntryId);

    if (error) throw error;
  },

  async forceEndAllActiveEntries(userId: string): Promise<void> {
    // Beende alle aktiven Einträge für diesen Benutzer
    const { error } = await supabase
      .from('time_entries')
      .update({
        end_time: new Date().toISOString(),
        status: 'completed',
        updated_at: new Date().toISOString(),
        note: 'Automatisch beendet aufgrund von Konflikt'
      })
      .eq('user_id', userId)
      .in('status', ['active', 'pending']);

    if (error) throw error;
  },

  async getTimeEntries(): Promise<TimeEntry[]> {
    // Hole den aktuellen Benutzer
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      throw new Error('Benutzer nicht authentifiziert: ' + authError.message);
    }
    if (!user?.id) {
      throw new Error('Benutzer-ID nicht gefunden');
    }

    const { data: entries, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return entries || [];
  },

  async getTimeEntriesByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    // Hole den aktuellen Benutzer
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      throw new Error('Benutzer nicht authentifiziert: ' + authError.message);
    }
    if (!user?.id) {
      throw new Error('Benutzer-ID nicht gefunden');
    }

    const { data: entries, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: false });

    if (error) throw error;
    return entries || [];
  },

  async getTodayTimeEntries(): Promise<TimeEntry[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return timeTrackingService.getTimeEntriesByDateRange(startOfDay, endOfDay);
  },

  async getWeekTimeEntries(): Promise<TimeEntry[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return timeTrackingService.getTimeEntriesByDateRange(startOfWeek, endOfWeek);
  },

  async deleteTimeEntry(timeEntryId: string): Promise<void> {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', timeEntryId);

    if (error) throw error;
  },

  async cleanupOrphanedEntries(userId: string): Promise<void> {
    // Bereinige Einträge mit end_time aber noch active/pending Status
    const { error } = await supabase
      .from('time_entries')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .in('status', ['active', 'pending'])
      .not('end_time', 'is', null);

    if (error) throw error;
  },

  // Neue Funktionen für erweiterte Funktionalität - Daten aus der Datenbank
  async getBreakTypes(): Promise<{ id: string; name: string }[]> {
    // Keine statischen Daten - wird später aus der Datenbank geladen
    return [];
  },

  async getProjects(): Promise<{ id: string; name: string }[]> {
    // Keine statischen Daten - wird später aus der Datenbank geladen
    return [];
  }
};

export type { TimeEntry };
