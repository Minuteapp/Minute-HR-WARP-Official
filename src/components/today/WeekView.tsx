import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
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

interface WeekViewProps {
  darkMode?: boolean;
}

const WeekView = ({ darkMode = false }: WeekViewProps) => {
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

  // Lade Aufgaben für die Woche
  const { data: tasks = [] } = useQuery({
    queryKey: ['week-tasks', weekStart.toISOString()],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .contains('assigned_to', [user.id])
        .gte('due_date', weekStart.toISOString())
        .lte('due_date', weekEnd.toISOString())
        .eq('status', 'open')
        .order('priority', { ascending: false })
        .limit(4);
      
      return data || [];
    },
    enabled: !!user
  });

  // Berechne KPIs aus echten Daten
  const kpis = useMemo(() => {
    const openTasks = tasks.length;
    const meetings = events.filter(e => e.type === 'meeting').length;
    const deadlines = tasks.filter(t => t.priority === 'high').length;
    
    return {
      openTasks,
      meetings,
      deadlines
    };
  }, [events, tasks]);

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

  const getEventColor = (type?: string) => {
    switch(type) {
      case 'meeting': return 'bg-blue-100 border-blue-300';
      case 'deadline': return 'bg-red-100 border-red-300';
      default: return 'bg-green-100 border-green-300';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high': return { text: 'Hoch', class: 'bg-red-500 text-white' };
      case 'medium': return { text: 'Mittel', class: 'bg-orange-500 text-white' };
      default: return { text: 'Niedrig', class: 'bg-gray-500 text-white' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header mit Kalenderwoche */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Kalenderwoche {weekNumber}</h2>
          <p className="text-sm text-gray-600">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Offene Aufgaben</p>
              <p className="text-2xl font-bold text-orange-600">{kpis.openTasks}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-200" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Meetings</p>
              <p className="text-2xl font-bold text-purple-600">{kpis.meetings}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-200" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deadlines</p>
              <p className="text-2xl font-bold text-red-600">{kpis.deadlines}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-200" />
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
                isTodayDay ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'
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
                  
                  // Farbe basierend auf Event-Typ
                  if (event.title?.toLowerCase().includes('deadline')) {
                    bgColor = 'bg-red-50 border-red-200';
                  } else if (event.title?.toLowerCase().includes('follow-up')) {
                    bgColor = 'bg-green-50 border-green-200';
                  } else if (event.type === 'meeting') {
                    bgColor = 'bg-gray-100 border-gray-300';
                  }
                  
                  return (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border ${bgColor}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
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

      {/* Wichtigste Aufgaben diese Woche */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Wichtigste Aufgaben diese Woche</h3>
          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task) => {
                const badge = getPriorityBadge(task.priority);
                const dueDate = task.due_date ? parseISO(task.due_date) : null;
                
                return (
                  <div
                    key={task.id}
                    className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-600">
                        {dueDate ? format(dueDate, 'EEE, d. MMM', { locale: de }) : 'Kein Datum'}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${badge.class}`}>
                      {badge.text}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-gray-500">
                Keine wichtigen Aufgaben diese Woche
              </div>
            )}
          </div>
        </Card>

        {/* Team-Verfügbarkeit */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Team-Verfügbarkeit</h3>
          <div className="flex items-center justify-center py-8 text-gray-500">
            <p>Keine Team-Daten verfügbar</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WeekView;
