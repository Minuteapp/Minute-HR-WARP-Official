
import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

// Platzhalter-Hook für Kalenderdaten
const useCalendarData = () => {
  return {
    timeEntries: [],
    absences: [],
    isLoading: false
  };
};

// Platzhalter-Hook für Kalenderberechnungen
const useCalendarCalculations = () => {
  return {
    calculateHoursForDay: (date: Date) => 0,
    getDayClassNames: (date: Date) => ""
  };
};

// Kalender-Tag-Komponente
const CalendarDayComponent = ({ date, calculateHoursForDay, getDayClassNames, displayMonth, activeModifiers }: any) => (
  <div className="relative w-full h-full flex justify-center items-center">
    <span className="text-sm">{date.getDate()}</span>
    {calculateHoursForDay(date) > 0 && (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded"></div>
    )}
  </div>
);

// Zeiteinträge-Liste
const TimeEntryList = ({ entries, calculateDailyHours, formatTimeOnly, formatDuration }: any) => {
  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Keine Einträge für diesen Tag</p>
        </div>
      ) : (
        entries.map((entry: any) => (
          <div key={entry.id} className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-sm">{entry.project || 'Allgemein'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimeOnly(entry.start_time)} - {entry.end_time ? formatTimeOnly(entry.end_time) : 'Laufend'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-600">
                  {entry.end_time ? formatDuration(entry.start_time, entry.end_time, entry.break_minutes) : 'Aktiv'}
                </p>
              </div>
            </div>
            {entry.description && (
              <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">{entry.description}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const TimeTrackingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const { timeEntries, absences, isLoading } = useCalendarData();
  const { calculateHoursForDay, getDayClassNames } = useCalendarCalculations();

  const formatTimeOnly = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const formatDuration = (startTime: string, endTime: string, breakMinutes?: number) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMinutes = (end.getTime() - start.getTime()) / 60000 - (breakMinutes || 0);
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = Math.floor(durationMinutes % 60);
    
    return `${hours}:${minutes.toString().padStart(2, '0')} h`;
  };

  const selectedDateEntries = selectedDate ? timeEntries?.filter((entry: any) => {
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
    <Card className="w-full shadow-sm border-[#33C3F0]/20">
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <CardTitle className="text-lg font-semibold text-gray-900">Zeiterfassung Kalender</CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={previousMonth}
            className="h-8 w-8 border-[#33C3F0]/40 hover:bg-[#33C3F0]/5"
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
            className="h-8 w-8 border-[#33C3F0]/40 hover:bg-[#33C3F0]/5"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border rounded-lg border-[#33C3F0]/20 p-3 bg-gradient-to-br from-[#33C3F0]/5 to-transparent">
            <Calendar
              locale={de}
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md w-full"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiersClassNames={{
                selected: 'bg-[#33C3F0] text-white hover:bg-[#33C3F0] hover:text-white',
              }}
              classNames={{
                day_today: "bg-[#33C3F0]/10 font-semibold text-[#33C3F0] border border-[#33C3F0]/30",
                day_outside: "text-gray-400 opacity-60",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-[#33C3F0]/10 transition-colors",
                head_cell: "text-gray-600 font-medium",
                caption: "text-gray-900 font-semibold"
              }}
              components={{
                DayContent: (props: any) => (
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
          
          <div className="space-y-4">
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
                
                <TimeEntryList
                  entries={selectedDateEntries}
                  calculateDailyHours={calculateHoursForDay}
                  formatTimeOnly={formatTimeOnly}
                  formatDuration={formatDuration}
                />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTrackingCalendar;
