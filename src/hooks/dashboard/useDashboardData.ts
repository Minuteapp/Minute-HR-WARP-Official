import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, startOfDay, endOfDay, format, differenceInMinutes } from 'date-fns';
import { de } from 'date-fns/locale';

// Zeiterfassung: Wochenstunden des aktuellen Benutzers
export const useWeeklyTimeTracking = () => {
  return useQuery({
    queryKey: ['dashboard-weekly-time'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { hours: 0, target: 40, trend: 0 };

      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const lastWeekStart = new Date(weekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(weekEnd);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

      // Diese Woche
      const { data: thisWeekData } = await supabase
        .from('time_entries')
        .select('start_time, end_time, duration_minutes')
        .eq('user_id', user.id)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString());

      // Letzte Woche für Trend
      const { data: lastWeekData } = await supabase
        .from('time_entries')
        .select('start_time, end_time, duration_minutes')
        .eq('user_id', user.id)
        .gte('start_time', lastWeekStart.toISOString())
        .lte('start_time', lastWeekEnd.toISOString());

      const calculateHours = (entries: any[] | null) => {
        if (!entries) return 0;
        return entries.reduce((acc, entry) => {
          if (entry.duration_minutes) {
            return acc + entry.duration_minutes / 60;
          }
          if (entry.start_time && entry.end_time) {
            return acc + differenceInMinutes(new Date(entry.end_time), new Date(entry.start_time)) / 60;
          }
          return acc;
        }, 0);
      };

      const thisWeekHours = calculateHours(thisWeekData);
      const lastWeekHours = calculateHours(lastWeekData);
      const trend = lastWeekHours > 0 ? Math.round(((thisWeekHours - lastWeekHours) / lastWeekHours) * 100) : 0;

      return {
        hours: Math.round(thisWeekHours * 10) / 10,
        target: 40,
        trend
      };
    },
    staleTime: 60000,
  });
};

// Team-Status: Online-Mitarbeiter
export const useTeamStatus = () => {
  return useQuery({
    queryKey: ['dashboard-team-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { online: 0, total: 0, homeOffice: 0, office: 0, away: 0 };

      // Hole company_id des aktuellen Users
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      const companyId = userRole?.company_id || '00000000-0000-0000-0000-000000000001';

      // Alle Mitarbeiter der Company zählen
      const { data: employees, count: totalCount } = await supabase
        .from('employees')
        .select('id, status', { count: 'exact' })
        .eq('company_id', companyId);

      // Aktive Zeiteinträge (heute, ohne end_time) = online
      const today = new Date();
      const { data: activeEntries } = await supabase
        .from('time_entries')
        .select('user_id, work_location')
        .gte('start_time', startOfDay(today).toISOString())
        .is('end_time', null);

      const uniqueActiveUsers = new Set(activeEntries?.map(e => e.user_id) || []);
      const homeOffice = activeEntries?.filter(e => e.work_location === 'home_office').length || 0;
      const office = activeEntries?.filter(e => e.work_location === 'office' || !e.work_location).length || 0;

      return {
        online: uniqueActiveUsers.size,
        total: totalCount || 0,
        homeOffice,
        office,
        away: Math.max(0, uniqueActiveUsers.size - homeOffice - office)
      };
    },
    staleTime: 30000,
  });
};

// Termine: Heutige Termine
export const useTodayAppointments = () => {
  return useQuery({
    queryKey: ['dashboard-today-appointments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { count: 0, next: null, appointments: [] };

      const today = new Date();
      const now = new Date();

      // Kalendereinträge für heute
      const { data: events } = await supabase
        .from('calendar_events')
        .select('id, title, start_time, end_time')
        .eq('user_id', user.id)
        .gte('start_time', startOfDay(today).toISOString())
        .lte('start_time', endOfDay(today).toISOString())
        .order('start_time', { ascending: true });

      // Nächster Termin
      const upcomingEvents = events?.filter(e => new Date(e.start_time) > now) || [];
      const nextEvent = upcomingEvents[0];
      
      let nextText = null;
      if (nextEvent) {
        const diff = differenceInMinutes(new Date(nextEvent.start_time), now);
        if (diff < 60) {
          nextText = `in ${diff}min`;
        } else {
          nextText = format(new Date(nextEvent.start_time), 'HH:mm', { locale: de });
        }
      }

      return {
        count: events?.length || 0,
        next: nextText,
        appointments: events?.slice(0, 3).map(e => e.title) || []
      };
    },
    staleTime: 60000,
  });
};

// Aufgaben: Offene Tasks
export const useOpenTasks = () => {
  return useQuery({
    queryKey: ['dashboard-open-tasks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { open: 0, total: 0, urgent: 0, normal: 0, completed: 0 };

      // Offene Aufgaben
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status, priority')
        .eq('assigned_to', user.id);

      const open = tasks?.filter(t => t.status !== 'done' && t.status !== 'completed').length || 0;
      const completed = tasks?.filter(t => t.status === 'done' || t.status === 'completed').length || 0;
      const urgent = tasks?.filter(t => 
        (t.status !== 'done' && t.status !== 'completed') && 
        (t.priority === 'high' || t.priority === 'urgent')
      ).length || 0;
      const normal = open - urgent;

      return {
        open,
        total: tasks?.length || 0,
        urgent,
        normal: Math.max(0, normal),
        completed
      };
    },
    staleTime: 60000,
  });
};

// Recruiting: Offene Stellen
export const useOpenPositions = () => {
  return useQuery({
    queryKey: ['dashboard-open-positions'],
    queryFn: async () => {
      const { data: positions } = await supabase
        .from('job_postings')
        .select('id, title, status')
        .eq('status', 'active')
        .limit(5);

      return {
        count: positions?.length || 0,
        positions: positions?.slice(0, 3).map(p => p.title) || []
      };
    },
    staleTime: 300000, // 5 Minuten
  });
};

// Ziele: Quartalsfortschritt
export const useGoalsProgress = () => {
  return useQuery({
    queryKey: ['dashboard-goals-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { progress: 0, achieved: 0, inProgress: 0, total: 0 };

      const { data: goals } = await supabase
        .from('goals')
        .select('id, status, progress')
        .eq('user_id', user.id);

      const achieved = goals?.filter(g => g.status === 'achieved' || g.progress >= 100).length || 0;
      const inProgress = goals?.filter(g => g.status === 'in_progress' || (g.progress > 0 && g.progress < 100)).length || 0;
      const total = goals?.length || 0;

      const avgProgress = total > 0 
        ? Math.round(goals!.reduce((acc, g) => acc + (g.progress || 0), 0) / total)
        : 0;

      return {
        progress: avgProgress,
        achieved,
        inProgress,
        total
      };
    },
    staleTime: 300000,
  });
};
