import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, TrendingUp, Clock, AlertCircle, Users, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  format, 
  getWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import { de } from 'date-fns/locale';

interface AdminWeekViewProps {
  darkMode?: boolean;
}

const AdminWeekView = ({ darkMode = false }: AdminWeekViewProps) => {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekNumber = getWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Lade Events für die Woche
  const { data: events = [] } = useQuery({
    queryKey: ['week-events', weekStart.toISOString()],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time');
      
      return data || [];
    },
    enabled: !!user
  });

  // Admin KPIs - keine Mockup-Daten
  const kpis = useMemo(() => ({
    teamHours: 0,
    openTickets: 0,
    activeUsers: 0,
    systemLoad: 0
  }), []);

  // System-Aufgaben - leer, keine Mockup-Daten
  const systemTasks: Array<{
    id: number;
    title: string;
    date: string;
    badge: { text: string; class: string };
  }> = [];

  // Abteilungs-Verfügbarkeit - leer, keine Mockup-Daten
  const departmentAvailability: Array<{
    name: string;
    availability: number[];
    total: number;
    available: number;
  }> = [];

  const getAvailabilityColor = (value: number, maxValue: number) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) return 'bg-green-400';
    if (percentage >= 60) return 'bg-green-300';
    if (percentage >= 40) return 'bg-orange-300';
    return 'bg-orange-400';
  };

  // Gruppiere Events nach Tag
  const eventsByDay = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = events.filter(event => {
        const eventDate = parseISO(event.start_time);
        return isSameDay(eventDate, day);
      });
    });
    
    return grouped;
  }, [events, weekDays]);

  return (
    <div className="space-y-6">
      {/* Header mit Kalenderwoche */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Kalenderwoche {weekNumber}</h2>
          <p className="text-sm text-muted-foreground">
            {format(weekStart, 'd.', { locale: de })} - {format(weekEnd, 'd. MMMM yyyy', { locale: de })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(new Date())}
          >
            Heute
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
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
              <p className="text-sm text-muted-foreground">Gesamt-Stunden (Team)</p>
              <p className="text-2xl font-bold text-blue-600">{kpis.teamHours} h</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-400" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Offene Tickets</p>
              <p className="text-2xl font-bold text-orange-600">{kpis.openTickets}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-400" />
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
              <p className="text-sm text-muted-foreground">System-Auslastung</p>
              <p className="text-2xl font-bold text-purple-600">{kpis.systemLoad}%</p>
            </div>
            <Activity className="h-8 w-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Wochenkalender */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day, index) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay[dayKey] || [];
          const isTodayDay = isToday(day);
          
          return (
            <div key={index} className="flex flex-col min-h-[400px]">
              {/* Tag-Header */}
              <div className={`text-center p-4 rounded-xl mb-3 ${
                isTodayDay ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}>
                <div className="text-sm font-medium">
                  {format(day, 'EEE', { locale: de })}
                </div>
                <div className="text-2xl font-bold mt-1">
                  {format(day, 'd')}
                </div>
              </div>
              
              {/* Events für diesen Tag */}
              <div className="space-y-2 flex-1">
                {dayEvents.map((event) => {
                  const eventTime = format(parseISO(event.start_time), 'HH:mm');
                  let bgColor = 'bg-blue-50 border-blue-200';
                  
                  if (event.title?.toLowerCase().includes('deadline')) {
                    bgColor = 'bg-red-50 border-red-200';
                  } else if (event.title?.toLowerCase().includes('follow-up')) {
                    bgColor = 'bg-green-50 border-green-200';
                  } else if (event.type === 'meeting') {
                    bgColor = 'bg-muted border-border';
                  }
                  
                  return (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border ${bgColor}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-sm font-medium">{eventTime}</span>
                      </div>
                      <div className="text-sm font-medium">{event.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* System-Übersicht und Abteilungs-Verfügbarkeit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System-Übersicht */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System-Übersicht</h3>
          <div className="space-y-3">
            {systemTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-muted rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.date}</p>
                </div>
                <Badge className={task.badge.class}>
                  {task.badge.text}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Abteilungs-Verfügbarkeit */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Abteilungs-Verfügbarkeit</h3>
          <div className="space-y-3">
            {departmentAvailability.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dept.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {dept.available}/{dept.total} verfügbar
                  </span>
                </div>
                <div className="flex gap-2">
                  {dept.availability.map((value, dayIndex) => {
                    const maxValue = dept.total / 5; // Durchschnittswert pro Tag
                    return (
                      <div
                        key={dayIndex}
                        className={`h-8 flex-1 rounded ${getAvailabilityColor(value, maxValue)}`}
                        title={`${value} Mitarbeiter`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminWeekView;
