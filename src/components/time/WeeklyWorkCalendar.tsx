import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, Coffee, MapPin, FileText, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface TimeEntry {
  id: string;
  start_time: string;
  end_time?: string;
  break_minutes?: number;
  project?: string;
  location?: string;
  note?: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
}

interface WeeklyWorkCalendarProps {
  employeeId: string;
}

export const WeeklyWorkCalendar = ({ employeeId }: WeeklyWorkCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start Montag
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['timeEntriesWeek', employeeId, format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', employeeId)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as TimeEntry[];
    }
  });

  const { data: absences = [] } = useQuery({
    queryKey: ['absencesWeek', employeeId, format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('absence_requests')
        .select('*')
        .eq('user_id', employeeId)
        .eq('status', 'approved')
        .lte('start_date', format(weekEnd, 'yyyy-MM-dd'))
        .gte('end_date', format(weekStart, 'yyyy-MM-dd'));
      
      if (error) throw error;
      return data || [];
    }
  });

  const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const previousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));

  const getEntriesForDay = (day: Date) => {
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      return isSameDay(entryDate, day);
    });
  };

  const getAbsenceForDay = (day: Date) => {
    return absences.find(absence => {
      const startDate = new Date(absence.start_date);
      const endDate = new Date(absence.end_date);
      return day >= startDate && day <= endDate;
    });
  };

  const calculateDayHours = (entries: TimeEntry[]) => {
    let totalMinutes = 0;
    entries.forEach(entry => {
      if (entry.end_time) {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
        totalMinutes += minutes - (entry.break_minutes || 0);
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    return `${hours}:${mins.toString().padStart(2, '0')}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const selectedDayEntries = selectedDay ? getEntriesForDay(selectedDay) : [];
  const selectedDayAbsence = selectedDay ? getAbsenceForDay(selectedDay) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
          <CardTitle className="text-xl font-semibold">Arbeitswochen-Kalender</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={previousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[160px] text-center">
              {format(weekStart, 'dd.MM', { locale: de })} - {format(weekEnd, 'dd.MM.yyyy', { locale: de })}
            </span>
            <Button variant="outline" size="icon" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, index) => {
              const dayEntries = getEntriesForDay(day);
              const dayAbsence = getAbsenceForDay(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isToday = isSameDay(day, new Date());
              const isWeekend = index === 5 || index === 6; // Sa/So

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                    isSelected && "ring-2 ring-primary shadow-md",
                    isToday && "bg-blue-50 border-blue-200",
                    isWeekend && "bg-gray-50",
                    dayAbsence && "bg-red-50 border-red-200"
                  )}
                  onClick={() => setSelectedDay(day)}
                >
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">
                      {format(day, 'EEE', { locale: de })}
                    </div>
                    <div className={cn(
                      "text-lg font-semibold",
                      isToday && "text-blue-600"
                    )}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  {dayAbsence ? (
                    <div className="mt-2">
                      <Badge variant="destructive" className="text-xs px-1 py-0">
                        {dayAbsence.type === 'vacation' ? 'Urlaub' : 'Abwesend'}
                      </Badge>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-1">
                      {dayEntries.length > 0 ? (
                        <>
                          <div className="text-xs text-center font-medium text-gray-700">
                            {calculateDayHours(dayEntries)}
                          </div>
                          <div className="space-y-1">
                            {dayEntries.slice(0, 2).map(entry => (
                              <div key={entry.id} className={cn(
                                "text-xs px-1 py-0.5 rounded text-center border",
                                getStatusColor(entry.status)
                              )}>
                                {entry.start_time && format(new Date(entry.start_time), 'HH:mm')}
                                {entry.end_time && ` - ${format(new Date(entry.end_time), 'HH:mm')}`}
                              </div>
                            ))}
                          </div>
                          {dayEntries.length > 2 && (
                            <div className="text-xs text-center text-gray-500">
                              +{dayEntries.length - 2} weitere
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-center text-gray-400">
                          Keine Einträge
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailansicht für ausgewählten Tag */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Details für {format(selectedDay, 'EEEE, d. MMMM yyyy', { locale: de })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayAbsence ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">
                  <Calendar className="h-12 w-12 mx-auto mb-2" />
                </div>
                <h3 className="text-lg font-semibold text-red-700 mb-1">
                  {selectedDayAbsence.type === 'vacation' ? 'Urlaubstag' : 'Abwesenheit'}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedDayAbsence.reason || 'Genehmigter Urlaubstag'}
                </p>
                <Badge variant="destructive" className="mt-2">
                  {selectedDayAbsence.status}
                </Badge>
              </div>
            ) : selectedDayEntries.length > 0 ? (
              <div className="space-y-4">
                {selectedDayEntries.map((entry, index) => (
                  <div key={entry.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          Eintrag {index + 1}
                        </span>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status === 'completed' ? 'Abgeschlossen' :
                           entry.status === 'active' ? 'Aktiv' :
                           entry.status === 'pending' ? 'Ausstehend' : 'Abgebrochen'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {entry.start_time && format(new Date(entry.start_time), 'HH:mm')}
                        {entry.end_time && ` - ${format(new Date(entry.end_time), 'HH:mm')}`}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {entry.project && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Projekt:</span>
                          <span className="font-medium">{entry.project}</span>
                        </div>
                      )}
                      
                      {entry.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Standort:</span>
                          <span className="font-medium">{entry.location}</span>
                        </div>
                      )}
                      
                      {entry.break_minutes && entry.break_minutes > 0 && (
                        <div className="flex items-center gap-2">
                          <Coffee className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Pause:</span>
                          <span className="font-medium">{entry.break_minutes} min</span>
                        </div>
                      )}
                    </div>

                    {entry.note && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Notiz:</div>
                        <div className="text-sm">{entry.note}</div>
                      </div>
                    )}

                    {index < selectedDayEntries.length - 1 && <Separator />}
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-blue-800">Gesamtarbeitszeit:</span>
                    <span className="font-bold text-blue-900">
                      {calculateDayHours(selectedDayEntries)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Keine Zeiteinträge für diesen Tag</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};