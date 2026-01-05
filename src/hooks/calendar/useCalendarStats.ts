import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, addHours, startOfWeek, endOfWeek } from 'date-fns';

export const useCalendarStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['calendar-stats'],
    queryFn: async () => {
      const now = new Date();
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const next2Hours = addHours(now, 2);

      // Heutige Events
      const { data: todayEvents, error: todayError } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', todayStart.toISOString())
        .lte('start_time', todayEnd.toISOString())
        .order('start_time');

      if (todayError) throw todayError;

      // Events diese Woche
      const { data: weekEvents, error: weekError } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString());

      if (weekError) throw weekError;

      // Konflikte
      const { data: conflicts, error: conflictsError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('conflict_status', 'hard')
        .gte('start_time', now.toISOString());

      if (conflictsError) throw conflictsError;

      // KI-Insights
      const { data: aiInsights, error: aiError } = await supabase
        .from('calendar_ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (aiError) throw aiError;

      // Berechne Meeting-Stunden diese Woche
      const meetingHours = weekEvents
        ?.filter(e => e.type === 'meeting')
        .reduce((acc, event) => {
          const start = new Date(event.start_time);
          const end = new Date(event.end_time);
          return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }, 0) || 0;

      const upcomingInNext2Hours = todayEvents?.filter(e => 
        new Date(e.start_time) <= next2Hours
      ).length || 0;

      return {
        todayEvents: todayEvents?.length || 0,
        thisWeekEvents: weekEvents?.length || 0,
        conflicts: conflicts?.length || 0,
        aiSuggestions: aiInsights?.filter(i => i.status === 'active').length || 0,
        upcomingInNext2Hours,
        weeklyMeetingHours: Math.round(meetingHours * 10) / 10,
        resolvedToday: 0, // TODO: Implement conflict resolution tracking
        todayEventsList: todayEvents || [],
        upcomingHighlights: todayEvents?.slice(0, 5) || [],
        stats: {
          todayEvents: todayEvents?.length || 0,
          thisWeekEvents: weekEvents?.length || 0,
          conflicts: conflicts?.length || 0,
          aiSuggestions: aiInsights?.filter(i => i.status === 'active').length || 0,
        },
        insights: aiInsights?.map(insight => ({
          title: insight.insight_type,
          message: insight.suggestion_text || '',
          severity: insight.severity || 'medium',
          action: 'Details ansehen',
        })) || [],
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  return {
    stats: data,
    insights: data?.insights || [],
    isLoading,
  };
};