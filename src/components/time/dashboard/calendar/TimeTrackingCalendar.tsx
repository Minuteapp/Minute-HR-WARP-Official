
import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useCalendarData } from './useCalendarData';
import { useCalendarCalculations } from './useCalendarCalculations';
import { CalendarDayComponent } from './CalendarDayComponent';
import { TimeEntryList } from './TimeEntryList';

type DayProps = any;

const TimeTrackingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const { timeEntries, absences, isLoading } = useCalendarData(currentMonth);
  const { calculateHoursForDay, getDayClassNames } = useCalendarCalculations(timeEntries);

  const formatTimeOnly = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const formatDuration = (startTime: string, endTime: string, breakMinutes?: number) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMinutes = (end.getTime() - start.getTime()) / 60000 - (breakMinutes || 0);
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = Math.floor(durationMinutes % 60);
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const selectedDateEntries = selectedDate ? timeEntries?.filter(entry => {
    const entryDate = new Date(entry.start_time);
    return entryDate.getDate() === selectedDate.getDate() &&
           entryDate.getMonth() === selectedDate.getMonth() &&
           entryDate.getFullYear() === selectedDate.getFullYear();
  }) : [];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Zeiterfassung Kalender</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <CardTitle className="text-lg font-semibold text-gray-900">Zeiterfassung Kalender</CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={previousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-600 min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: de })}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-transparent">
            <Calendar
              locale={de}
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md w-full"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiersClassNames={{
                selected: 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white',
              }}
              classNames={{
                day_today: "bg-blue-50 font-semibold text-blue-600 border border-blue-200",
                day_outside: "text-gray-400 opacity-60",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-50 transition-colors",
                head_cell: "text-gray-600 font-medium",
                caption: "text-gray-900 font-semibold"
              }}
              components={{
                DayContent: (props: DayProps) => (
                  <CalendarDayComponent
                    date={props.date}
                    calculateHoursForDay={calculateHoursForDay}
                    getDayClassNames={getDayClassNames}
                    displayMonth={props.displayMonth}
                    activeModifiers={props.modifiers ? 
                      Object.keys(props.modifiers).reduce((acc: Record<string, true>, key) => {
                        if (props.modifiers && props.modifiers[key]) acc[key] = true;
                        return acc;
                      }, {}) : 
                      {}
                    }
                  />
                )
              }}
            />
          </div>
          
          <div className="space-y-4 min-h-[400px]">
            {selectedDate && (
              <>
                <div className="border-b pb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Einträge für diesen Tag
                  </p>
                </div>
                
                <div className="overflow-y-auto max-h-[350px]">
                  <TimeEntryList
                    entries={selectedDateEntries}
                    calculateDailyHours={calculateHoursForDay}
                    formatTimeOnly={formatTimeOnly}
                    formatDuration={formatDuration}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTrackingCalendar;
