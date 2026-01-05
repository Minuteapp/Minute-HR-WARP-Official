
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/time-tracking.types';

interface ProjectTimeEntry extends TimeEntry {
  project_id?: string;
  calendar_event_id?: string;
}

export const projectTimeIntegrationService = {
  // Erstelle Zeiterfassungseintrag mit Projektverknüpfung
  createProjectTimeEntry: async (timeEntry: Partial<ProjectTimeEntry>) => {
    console.log('Creating project time entry:', timeEntry);
    
    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: timeEntry.user_id || crypto.randomUUID(),
        start_time: timeEntry.start_time || new Date().toISOString(),
        end_time: timeEntry.end_time,
        status: timeEntry.status || 'active',
        project: timeEntry.project_id || timeEntry.project || 'project-work',
        location: timeEntry.location || 'office',
        note: timeEntry.note || 'Projektarbeit',
        break_minutes: timeEntry.break_minutes || 0,
        category: 'project_work',
        tags: timeEntry.tags || ['project'],
        department: timeEntry.department
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project time entry:', error);
      throw error;
    }

    console.log('Project time entry created:', data);
    return data;
  },

  // Hole alle Zeiterfassungseinträge für ein Projekt
  getProjectTimeEntries: async (projectId: string) => {
    console.log('Fetching time entries for project:', projectId);
    
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('project', projectId)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching project time entries:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} time entries for project ${projectId}`);
    return data || [];
  },

  // Hole Zeiterfassungseinträge mit Projektinformationen
  getTimeEntriesWithProjects: async (userId?: string) => {
    console.log('Fetching time entries with project info for user:', userId);
    
    let query = supabase
      .from('time_entries')
      .select(`
        *,
        projects:project (
          id,
          name,
          description,
          status
        )
      `);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching time entries with projects:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} time entries with project info`);
    return data || [];
  },

  // Berechne Gesamtarbeitszeit für ein Projekt
  calculateProjectWorkTime: async (projectId: string, startDate?: Date, endDate?: Date) => {
    console.log('Calculating work time for project:', projectId, { startDate, endDate });
    
    let query = supabase
      .from('time_entries')
      .select('start_time, end_time, break_minutes')
      .eq('project', projectId)
      .eq('status', 'completed');

    if (startDate) {
      query = query.gte('start_time', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('start_time', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error calculating project work time:', error);
      throw error;
    }

    const totalSeconds = (data || []).reduce((total, entry) => {
      if (!entry.end_time) return total;
      
      const start = new Date(entry.start_time).getTime();
      const end = new Date(entry.end_time).getTime();
      const breakMinutes = entry.break_minutes || 0;
      
      const workSeconds = (end - start) / 1000 - (breakMinutes * 60);
      return total + Math.max(0, workSeconds);
    }, 0);

    const totalHours = totalSeconds / 3600;
    
    console.log(`Total work time for project ${projectId}: ${totalHours.toFixed(2)} hours`);
    return {
      totalHours,
      totalSeconds,
      entryCount: data?.length || 0
    };
  },

  // Verknüpfe bestehenden Zeiteintrag mit Projekt
  linkTimeEntryToProject: async (timeEntryId: string, projectId: string) => {
    console.log('Linking time entry to project:', { timeEntryId, projectId });
    
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        project: projectId,
        category: 'project_work',
        tags: ['project', 'linked']
      })
      .eq('id', timeEntryId)
      .select()
      .single();

    if (error) {
      console.error('Error linking time entry to project:', error);
      throw error;
    }

    console.log('Time entry linked to project successfully:', data);
    return data;
  },

  // Entferne Projektverknüpfung von Zeiteintrag
  unlinkTimeEntryFromProject: async (timeEntryId: string) => {
    console.log('Unlinking time entry from project:', timeEntryId);
    
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        project: 'general',
        category: 'general',
        tags: []
      })
      .eq('id', timeEntryId)
      .select()
      .single();

    if (error) {
      console.error('Error unlinking time entry from project:', error);
      throw error;
    }

    console.log('Time entry unlinked from project successfully:', data);
    return data;
  }
};
