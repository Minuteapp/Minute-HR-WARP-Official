import { CalendarView, UserRole } from "@/components/CalendarModule";
import { CalendarEvent } from "../shared/CalendarWeekGrid";
import { CalendarViewRenderer } from "../shared/CalendarViewRenderer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface MyAppointmentsTabProps {
  view: CalendarView;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  userRole: UserRole;
  zoomLevel: number;
}

export function MyAppointmentsTab({
  view,
  currentDate,
  setCurrentDate,
  zoomLevel,
}: MyAppointmentsTabProps) {
  // Fetch real events from Supabase
  const { data: dbEvents = [], isLoading } = useQuery({
    queryKey: ['my-calendar-events'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('created_by', user.id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching calendar events:', error);
        return [];
      }

      console.log('Fetched calendar events:', data);
      return data || [];
    }
  });

  // Map database events to UI format
  const events: CalendarEvent[] = dbEvents.map(e => ({
    id: e.id,
    title: e.title,
    start: new Date(e.start_time),
    end: new Date(e.end_time),
    color: e.color || '#6366f1',
    category: e.type || 'meeting',
    location: e.location || undefined,
    description: e.description || undefined,
    participants: Array.isArray(e.attendees) ? e.attendees as string[] : [],
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <CalendarViewRenderer
      view={view}
      currentDate={currentDate}
      setCurrentDate={setCurrentDate}
      events={events}
      zoomLevel={zoomLevel}
    />
  );
}
