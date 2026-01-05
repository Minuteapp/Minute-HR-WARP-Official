import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  subMonths, 
  format, 
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
  startOfWeek,
  endOfWeek,
  getWeek
} from 'date-fns';
import { de } from 'date-fns/locale';

interface MonthViewProps {
  darkMode?: boolean;
}

const MonthView = ({ darkMode = false }: MonthViewProps) => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Lade Events für den Monat
  const { data: events = [] } = useQuery({
    queryKey: ['month-events', monthStart.toISOString()],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString())
        .order('start_time');
      
      return data || [];
    },
    enabled: !!user
  });

  // Lade Zeiteinträge für den Monat
  const { data: timeEntries = [] } = useQuery({
    queryKey: ['month-time-entries', monthStart.toISOString()],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString());
      
      return data || [];
    },
    enabled: !!user
  });

  // Berechne KPIs aus echten Daten
  const kpis = useMemo(() => {
    const totalHours = timeEntries.reduce((sum, entry) => {
      if (entry.start_time && entry.end_time) {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);
    
    const totalMeetings = events.filter(e => e.type === 'meeting').length;
    
    return {
      totalHours: totalHours.toFixed(1),
      totalMeetings,
    };
  }, [events, timeEntries]);

  // Gruppiere Events nach Tag
  const eventsByDay = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    calendarDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = events.filter(event => {
        const eventDate = parseISO(event.start_time);
        return isSameDay(eventDate, day);
      });
    });
    
    return grouped;
  }, [events, calendarDays]);

  // Kommende Ereignisse
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => new Date(e.start_time) > now)
      .slice(0, 4)
      .map(e => ({
        ...e,
        date: format(parseISO(e.start_time), 'd. MMM', { locale: de })
      }));
  }, [events]);

  const getEventColor = (title: string) => {
    if (title?.toLowerCase().includes('kick-off')) return 'bg-blue-100 text-blue-800';
    if (title?.toLowerCase().includes('review')) return 'bg-purple-100 text-purple-800';
    if (title?.toLowerCase().includes('projekt') || title?.toLowerCase().includes('deadline')) return 'bg-red-100 text-red-800';
    if (title?.toLowerCase().includes('urlaub')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header mit Monat */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: de })}
          </h2>
          <p className="text-sm text-gray-600">
            {calendarDays.length} Tage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Dieser Monat
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Arbeitsstunden</p>
              <p className="text-2xl font-bold text-blue-600">{kpis.totalHours} h</p>
            </div>
            <Clock className="h-8 w-8 text-blue-200" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Meetings gesamt</p>
              <p className="text-2xl font-bold text-purple-600">{kpis.totalMeetings}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-200" />
          </div>
        </Card>
      </div>

      {/* Monatskalender */}
      <Card className="p-6">
        <div className="grid grid-cols-7 gap-2">
          {/* Wochentage Header */}
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
            <div key={day} className="text-center font-medium text-gray-600 pb-2">
              {day}
            </div>
          ))}
          
          {/* Kalendertage */}
          {calendarDays.map((day, index) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay[dayKey] || [];
            const isTodayDay = isToday(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            
            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  !isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white'
                } ${isTodayDay ? 'border-primary border-2' : 'border-gray-200'}`}
              >
                <div className={`text-sm font-medium ${
                  isTodayDay ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded truncate ${getEventColor(event.title)}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Kommende Ereignisse */}
      <div className="grid grid-cols-1 gap-6">

        {/* Kommende Ereignisse */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Kommende Ereignisse</h3>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                >
                  <div className={`w-2 h-12 rounded ${
                    event.title?.toLowerCase().includes('deadline') ? 'bg-red-500' : 
                    event.title?.toLowerCase().includes('urlaub') ? 'bg-orange-500' : 
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                Keine kommenden Ereignisse
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Aktivitäts-Heatmap */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Aktivitäts-Heatmap</h3>
        <div className="space-y-2">
          {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'].map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600">{day}</div>
              <div className="flex-1 flex gap-1">
                {[0, 1, 2, 3, 4].map((weekIndex) => {
                  // Leere Heatmap - wird mit echten Daten gefüllt
                  return (
                    <div
                      key={weekIndex}
                      className="h-8 flex-1 rounded bg-muted"
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
          <span>Weniger</span>
          <div className="h-3 w-3 rounded bg-green-100" />
          <div className="h-3 w-3 rounded bg-green-200" />
          <div className="h-3 w-3 rounded bg-green-400" />
          <div className="h-3 w-3 rounded bg-green-600" />
          <span>Mehr</span>
        </div>
      </Card>
    </div>
  );
};

export default MonthView;
