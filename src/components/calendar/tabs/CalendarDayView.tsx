import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CalendarDayView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [gridInterval, setGridInterval] = useState<number>(15);
  const [showTimezones, setShowTimezones] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-day-events', selectedDate],
    queryFn: async () => {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time');

      if (error) throw error;
      return data;
    },
  });

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += gridInterval) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          hour,
          minute,
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  const getEventPosition = (event: any) => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    
    const slotHeight = 60; // Height per hour in pixels
    const pixelsPerMinute = slotHeight / 60;
    
    return {
      top: `${startMinutes * pixelsPerMinute}px`,
      height: `${duration * pixelsPerMinute}px`,
    };
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {/* Header mit Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Heute
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold ml-4">
              {format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Select value={gridInterval.toString()} onValueChange={(v) => setGridInterval(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Minuten</SelectItem>
                <SelectItem value="10">10 Minuten</SelectItem>
                <SelectItem value="15">15 Minuten</SelectItem>
                <SelectItem value="30">30 Minuten</SelectItem>
                <SelectItem value="60">60 Minuten</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant={showTimezones ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setShowTimezones(!showTimezones)}
            >
              <Globe className="h-4 w-4 mr-2" />
              Zeitzonen
            </Button>
          </div>
        </div>

        {/* Timeline-Grid */}
        <Card className="overflow-hidden flex-1 min-h-0">
          <div className="overflow-y-auto h-[calc(100vh-280px)]">
            <div className="grid grid-cols-[80px_1fr] relative">
              {/* Zeitmarker links */}
              <div className="bg-muted/50">
                {timeSlots.filter((_, i) => i % (60 / gridInterval) === 0).map((slot) => (
                  <div 
                    key={slot.time}
                    className="h-[60px] border-b border-border text-right pr-3 pt-2 text-sm text-muted-foreground"
                  >
                    {slot.time}
                  </div>
                ))}
              </div>

              {/* Event-Bereich */}
              <div className="relative">
                {/* Zeitraster-Linien */}
                {timeSlots.filter((_, i) => i % (60 / gridInterval) === 0).map((slot, i) => (
                  <div 
                    key={i}
                    className="h-[60px] border-b border-border hover:bg-accent/50 cursor-pointer transition-colors"
                  />
                ))}

                {/* Aktuelle Zeit-Marker */}
                {new Date().toDateString() === selectedDate.toDateString() && (
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-destructive z-10"
                    style={{
                      top: `${(new Date().getHours() * 60 + new Date().getMinutes()) * (60 / 60)}px`,
                    }}
                  >
                    <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-destructive rounded-full" />
                  </div>
                )}

                {/* Events */}
                {!isLoading && events?.map((event) => {
                  const position = getEventPosition(event);
                  return (
                    <div
                      key={event.id}
                      className="absolute left-2 right-2 rounded-md p-2 text-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow z-20 border-l-4"
                      style={{
                        ...position,
                        backgroundColor: event.color || '#3B82F6',
                        borderLeftColor: event.color || '#3B82F6',
                        opacity: 0.9,
                      }}
                    >
                      <div className="font-medium text-white">{event.title}</div>
                      <div className="text-xs text-white/80 mt-1">
                        {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-muted-foreground">Lädt Termine...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DndProvider>
  );
};

export default CalendarDayView;