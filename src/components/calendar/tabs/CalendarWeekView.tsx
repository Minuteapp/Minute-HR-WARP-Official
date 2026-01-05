import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CalendarWeekView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-week-events', weekStart],
    queryFn: async () => {
      const weekEnd = addDays(weekStart, 7);
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time');

      if (error) throw error;
      return data;
    },
  });

  const getEventsForDay = (day: Date) => {
    return events?.filter(event => {
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, day);
    }) || [];
  };

  const handlePrevWeek = () => setSelectedDate(subWeeks(selectedDate, 1));
  const handleNextWeek = () => setSelectedDate(addWeeks(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Heute
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold ml-4">
            {format(weekStart, 'wo', { locale: de })} Woche - {format(weekStart, 'MMMM yyyy', { locale: de })}
          </h2>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-8">
          {/* Zeit-Spalte */}
          <div className="bg-muted/50 border-r">
            <div className="h-16 border-b" /> {/* Header-Spacer */}
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="h-16 border-b px-2 py-1 text-sm text-right text-muted-foreground">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Tages-Spalten */}
          {weekDays.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div key={dayIndex} className={`border-r ${isToday ? 'bg-primary/5' : ''}`}>
                {/* Tag-Header */}
                <div className={`h-16 border-b flex flex-col items-center justify-center ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                  <div className="text-xs">{format(day, 'EEE', { locale: de })}</div>
                  <div className="text-2xl font-bold">{format(day, 'd')}</div>
                </div>

                {/* Stunden-Raster */}
                <div className="relative">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="h-16 border-b hover:bg-accent/50 cursor-pointer transition-colors" />
                  ))}

                  {/* Events */}
                  {dayEvents.map(event => {
                    const start = new Date(event.start_time);
                    const end = new Date(event.end_time);
                    const startHour = start.getHours() + start.getMinutes() / 60;
                    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    
                    return (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 rounded-md p-2 text-xs overflow-hidden cursor-pointer hover:shadow-lg transition-shadow z-10 border-l-4"
                        style={{
                          top: `${startHour * 64}px`,
                          height: `${duration * 64}px`,
                          backgroundColor: event.color || '#3B82F6',
                          borderLeftColor: event.color || '#3B82F6',
                          opacity: 0.9,
                        }}
                      >
                        <div className="font-medium text-white truncate">{event.title}</div>
                        <div className="text-[10px] text-white/80 mt-1">
                          {format(start, 'HH:mm')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default CalendarWeekView;