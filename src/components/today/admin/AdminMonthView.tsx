import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, Users, Activity, TrendingUp } from 'lucide-react';
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
  endOfWeek
} from 'date-fns';
import { de } from 'date-fns/locale';

interface AdminMonthViewProps {
  darkMode?: boolean;
}

const AdminMonthView = ({ darkMode = false }: AdminMonthViewProps) => {
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

  // Admin KPIs - keine Mockup-Daten
  const kpis = useMemo(() => ({
    totalWorkHours: 0,
    activeUsers: 0,
    systemEvents: 0,
    systemLoad: 0
  }), []);

  // System-Highlights - leer, keine Mockup-Daten
  const systemHighlights: Array<{
    icon: typeof Users;
    iconColor: string;
    title: string;
    subtitle: string;
  }> = [];

  // Wichtige System-Events - leer, keine Mockup-Daten
  const systemEvents: Array<{
    id: number;
    title: string;
    date: string;
    color: string;
  }> = [];

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

  const getEventColor = (title: string) => {
    if (title?.toLowerCase().includes('kick-off')) return 'bg-blue-100 text-blue-800';
    if (title?.toLowerCase().includes('review')) return 'bg-purple-100 text-purple-800';
    if (title?.toLowerCase().includes('projekt') || title?.toLowerCase().includes('deadline')) return 'bg-red-100 text-red-800';
    if (title?.toLowerCase().includes('urlaub')) return 'bg-orange-100 text-orange-800';
    return 'bg-muted text-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header mit Monat */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: de })}
          </h2>
          <p className="text-sm text-muted-foreground">
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

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gesamt-Arbeitsstunden</p>
              <p className="text-2xl font-bold text-purple-600">{kpis.totalWorkHours} h</p>
            </div>
            <Clock className="h-8 w-8 text-purple-400" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aktive Nutzer</p>
              <p className="text-2xl font-bold text-green-600">{kpis.activeUsers}</p>
            </div>
            <Users className="h-8 w-8 text-green-400" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">System-Events</p>
              <p className="text-2xl font-bold text-purple-600">{kpis.systemEvents}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-400" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Systemlast</p>
              <p className="text-2xl font-bold text-orange-600">+{kpis.systemLoad}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-400" />
          </div>
        </Card>
      </div>

      {/* Monatskalender */}
      <Card className="p-6">
        <div className="grid grid-cols-7 gap-2">
          {/* Wochentage Header */}
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
            <div key={day} className="text-center font-medium text-muted-foreground pb-2">
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
                  !isCurrentMonth ? 'bg-muted/50 opacity-50' : 'bg-background'
                } ${isTodayDay ? 'border-primary border-2' : 'border-border'}`}
              >
                <div className={`text-sm font-medium ${
                  isTodayDay ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''
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
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* System-Highlights und System-Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System-Highlights des Monats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System-Highlights des Monats</h3>
          <div className="space-y-4">
            {systemHighlights.map((highlight, index) => {
              const Icon = highlight.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${highlight.iconColor}`} />
                  <div>
                    <h4 className="font-medium">{highlight.title}</h4>
                    <p className="text-sm text-muted-foreground">{highlight.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Wichtige System-Events */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Wichtige System-Events</h3>
          <div className="space-y-3">
            {systemEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted"
              >
                <div className={`w-2 h-12 rounded ${event.color}`} />
                <div className="flex-1">
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Aktivitäts-Heatmap - ohne Mockup-Daten */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Aktivitäts-Heatmap</h3>
        <div className="space-y-2">
          {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'].map((day) => (
            <div key={day} className="flex items-center gap-3">
              <div className="w-24 text-sm text-muted-foreground">{day}</div>
              <div className="flex-1 flex gap-1">
                {[0, 1, 2, 3, 4].map((weekIndex) => (
                  <div
                    key={weekIndex}
                    className="h-8 flex-1 rounded bg-muted"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Weniger</span>
          <div className="h-3 w-3 rounded bg-green-100" />
          <div className="h-3 w-3 rounded bg-green-200" />
          <div className="h-3 w-3 rounded bg-green-400" />
          <div className="h-3 w-3 rounded bg-green-600" />
          <span>Mehr</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">Keine Aktivitätsdaten verfügbar</p>
      </Card>
    </div>
  );
};

export default AdminMonthView;
