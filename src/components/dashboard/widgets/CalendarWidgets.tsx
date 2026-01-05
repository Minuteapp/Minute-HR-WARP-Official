import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  type: string;
  color: string;
}

export const TodayEventsWidget: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayEvents = async () => {
      try {
        const today = new Date();
        const startOfDay = format(today, 'yyyy-MM-dd\'T\'00:00:00.000\'Z\'');
        const endOfDay = format(today, 'yyyy-MM-dd\'T\'23:59:59.999\'Z\'');

        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('start_time', startOfDay)
          .lte('start_time', endOfDay)
          .order('start_time', { ascending: true })
          .limit(5);

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Fehler beim Laden der heutigen Termine:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayEvents();
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Heutige Termine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Heutige Termine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm">Keine Termine heute</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-center gap-2 p-2 rounded border">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: event.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(event.start_time), 'HH:mm', { locale: de })} - 
                  {format(new Date(event.end_time), 'HH:mm', { locale: de })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export const WeekOverviewWidget: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeekEvents = async () => {
      try {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('start_time', weekStart.toISOString())
          .lte('start_time', weekEnd.toISOString())
          .order('start_time', { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Fehler beim Laden der Wochentermine:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekEvents();
  }, []);

  const groupEventsByDay = (events: CalendarEvent[]) => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
      return {
        date,
        name: format(date, 'EEE', { locale: de }),
        events: events.filter(event => 
          format(new Date(event.start_time), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
      };
    });
    return days;
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Wochenübersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const dayGroups = groupEventsByDay(events);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Wochenübersicht
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {dayGroups.map((day, index) => (
            <div key={index} className="space-y-1">
              <div className="text-xs font-medium text-center p-1">
                {day.name}
              </div>
              <div className="space-y-1 min-h-16">
                {day.events.slice(0, 3).map((event) => (
                  <div 
                    key={event.id}
                    className="text-xs p-1 rounded text-white"
                    style={{ backgroundColor: event.color }}
                    title={event.title}
                  >
                    {event.title.length > 10 ? event.title.substring(0, 10) + '...' : event.title}
                  </div>
                ))}
                {day.events.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{day.events.length - 3} weitere
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};