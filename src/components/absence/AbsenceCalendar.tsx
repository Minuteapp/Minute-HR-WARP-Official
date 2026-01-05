import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Shield, Clock, Home, X, Calendar as CalendarIcon, Ban } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AbsenceEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'vacation' | 'sick' | 'homeoffice' | 'business' | 'special';
  status: 'pending' | 'approved' | 'rejected';
  employee: string;
  department?: string;
}

interface Holiday {
  id: string;
  name: string;
  holiday_date: string;
  is_public_holiday: boolean;
  location_code: string;
}

interface BlackoutPeriod {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  department?: string;
  is_active: boolean;
}

export interface AbsenceCalendarProps {
  view: 'day' | 'week' | 'month';
  date: Date | undefined;
  onDateChange: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick?: (date?: Date) => void;
  userRole?: 'employee' | 'manager' | 'admin';
}

const AbsenceCalendar = ({ 
  view, 
  date = new Date(), 
  onDateChange, 
  onPrevMonth, 
  onNextMonth, 
  onDayClick,
  userRole = 'employee' 
}: AbsenceCalendarProps) => {
  const [events, setEvents] = useState<AbsenceEvent[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [blackoutPeriods, setBlackoutPeriods] = useState<BlackoutPeriod[]>([]);
  const { toast } = useToast();

  // Lade Abwesenheitsdaten, Feiertage und Blackout-Perioden
  useEffect(() => {
    const loadData = async () => {
      try {
        // Lade aus absence_requests
        const { data: requests, error: requestsError } = await supabase
          .from('absence_requests')
          .select('*')
          .order('start_date', { ascending: false });

        if (requestsError) {
          console.error('Fehler beim Laden der Abwesenheitsanträge:', requestsError);
        }

        // Lade aus absences (genehmigte Abwesenheiten)
        const { data: absences, error: absencesError } = await supabase
          .from('absences')
          .select('*')
          .order('start_date', { ascending: false });

        if (absencesError) {
          console.error('Fehler beim Laden der genehmigten Abwesenheiten:', absencesError);
        }

        // Lade Feiertage
        const { data: holidayData, error: holidaysError } = await supabase
          .from('absence_holidays')
          .select('*')
          .order('holiday_date', { ascending: true });

        if (holidaysError) {
          console.error('Fehler beim Laden der Feiertage:', holidaysError);
        } else {
          setHolidays(holidayData || []);
        }

        // Lade Blackout-Perioden
        const { data: blackoutData, error: blackoutError } = await supabase
          .from('absence_blackout_periods')
          .select('*')
          .eq('is_active', true)
          .order('start_date', { ascending: true });

        if (blackoutError) {
          console.error('Fehler beim Laden der Sperrzeiträume:', blackoutError);
        } else {
          setBlackoutPeriods(blackoutData || []);
        }

        // Kombiniere und konvertiere die Abwesenheitsdaten
        const combinedEvents: AbsenceEvent[] = [];

        if (requests) {
          requests.forEach(request => {
            combinedEvents.push({
              id: request.id,
              title: request.employee_name || 'Unbekannter Mitarbeiter',
              start: new Date(request.start_date),
              end: new Date(request.end_date),
              type: request.type === 'sick_leave' ? 'sick' : (request.type as any) || 'vacation',
              status: request.status as any,
              employee: request.employee_name || 'Unbekannter Mitarbeiter',
              department: request.department
            });
          });
        }

        if (absences) {
          absences.forEach(absence => {
            const existsAsRequest = requests?.some(request => 
              request.user_id === absence.user_id &&
              format(new Date(request.start_date), 'yyyy-MM-dd') === format(new Date(absence.start_date), 'yyyy-MM-dd') &&
              format(new Date(request.end_date), 'yyyy-MM-dd') === format(new Date(absence.end_date), 'yyyy-MM-dd')
            );

            if (!existsAsRequest) {
              combinedEvents.push({
                id: absence.id,
                title: 'Genehmigte Abwesenheit',
                start: new Date(absence.start_date),
                end: new Date(absence.end_date),
                type: 'vacation',
                status: 'approved',
                employee: 'Mitarbeiter',
                department: undefined
              });
            }
          });
        }

        setEvents(combinedEvents);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
      }
    };

    loadData();
  }, []);

  const handleApproval = async (eventId: string, action: 'approve' | 'reject') => {
    if (userRole === 'employee') {
      toast({
        title: "Keine Berechtigung",
        description: "Sie haben keine Berechtigung, Anträge zu genehmigen.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('absence_requests')
      .update({ status: action === 'approve' ? 'approved' : 'rejected' })
      .eq('id', eventId);

    if (error) {
      console.error('Error updating absence:', error);
      toast({
        title: "Fehler",
        description: "Der Antrag konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
      return;
    }

    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          status: action === 'approve' ? 'approved' : 'rejected'
        };
      }
      return event;
    }));

    toast({
      title: action === 'approve' ? "Antrag genehmigt" : "Antrag abgelehnt",
      description: `Der Antrag wurde erfolgreich ${action === 'approve' ? 'genehmigt' : 'abgelehnt'}.`
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'bg-blue-500';
      case 'sick':
        return 'bg-red-500';
      case 'homeoffice':
        return 'bg-green-500';
      case 'business':
        return 'bg-purple-500';
      case 'special':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vacation':
        return <Clock className="h-4 w-4" />;
      case 'sick':
        return <X className="h-4 w-4" />;
      case 'homeoffice':
        return <Home className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Hilfsfunktion: Ist ein Tag ein Feiertag?
  const isHoliday = (day: Date): Holiday | undefined => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return holidays.find(h => h.holiday_date === dayStr);
  };

  // Hilfsfunktion: Ist ein Tag in einer Blackout-Periode?
  const isBlackout = (day: Date): BlackoutPeriod | undefined => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return blackoutPeriods.find(bp => 
      dayStr >= bp.start_date && dayStr <= bp.end_date
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const holiday = isHoliday(date);
    const blackout = isBlackout(date);

    return (
      <div className="space-y-4">
        {/* Feiertag/Blackout Header */}
        {(holiday || blackout) && (
          <div className="space-y-2">
            {holiday && (
              <div className="flex items-center gap-2 p-2 bg-amber-100 rounded-lg text-amber-800">
                <CalendarIcon className="h-4 w-4" />
                <span className="font-medium">{holiday.name}</span>
                {holiday.is_public_holiday && <Badge variant="outline">Gesetzlicher Feiertag</Badge>}
              </div>
            )}
            {blackout && (
              <div className="flex items-center gap-2 p-2 bg-red-100 rounded-lg text-red-800">
                <Ban className="h-4 w-4" />
                <span className="font-medium">Urlaubssperre: {blackout.reason}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-[60px_1fr] gap-2">
          <div className="space-y-2">
            {hours.map(hour => (
              <div key={hour} className="h-12 text-xs text-gray-500 flex items-center justify-end pr-2">
                {`${hour.toString().padStart(2, '0')}:00`}
              </div>
            ))}
          </div>
          <div className="relative">
            {hours.map(hour => (
              <div key={hour} className="h-12 border-t border-gray-200" />
            ))}
            {events.map(event => {
              const startHour = event.start.getHours();
              const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
              
              return (
                <div
                  key={event.id}
                  className={`absolute left-0 right-2 p-1 rounded ${getTypeColor(event.type)}`}
                  style={{
                    top: `${startHour * 48}px`,
                    height: `${duration * 48}px`,
                    minHeight: '24px'
                  }}
                >
                  <div className="text-white text-xs">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`${getStatusColor(event.status)} text-xs`}>
                        {event.status}
                      </Badge>
                      {userRole !== 'employee' && event.status === 'pending' && (
                        <Shield 
                          className="h-3 w-3 cursor-pointer hover:text-green-200"
                          onClick={() => handleApproval(event.id, 'approve')}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 truncate">
                      {getTypeIcon(event.type)}
                      <span className="truncate">{event.title}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = eachDayOfInterval({
      start: startOfWeek(date, { locale: de }),
      end: endOfWeek(date, { locale: de })
    });

    return (
      <TooltipProvider>
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map(day => {
            const holiday = isHoliday(day);
            const blackout = isBlackout(day);
            
            return (
              <div 
                key={day.toISOString()} 
                className={`min-h-[200px] ${holiday ? 'bg-amber-50' : ''} ${blackout ? 'bg-red-50' : ''}`}
              >
                <h3 className="font-medium text-center mb-2">
                  {format(day, 'EEEE', { locale: de })}
                  <br />
                  {format(day, 'd.MM.', { locale: de })}
                </h3>
                
                {/* Feiertag-/Blackout-Marker */}
                {holiday && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mx-1 mb-1 p-1 bg-amber-200 rounded text-xs text-amber-800 flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span className="truncate">{holiday.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{holiday.name}</p>
                      {holiday.is_public_holiday && <p className="text-xs">Gesetzlicher Feiertag</p>}
                    </TooltipContent>
                  </Tooltip>
                )}
                {blackout && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mx-1 mb-1 p-1 bg-red-200 rounded text-xs text-red-800 flex items-center gap-1">
                        <Ban className="h-3 w-3" />
                        <span className="truncate">Sperre</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Urlaubssperre</p>
                      <p className="text-xs">{blackout.reason}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                <div className="space-y-1">
                  {events
                    .filter(event => 
                      format(event.start, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                    )
                    .map(event => (
                      <div
                        key={event.id}
                        className={`p-2 rounded ${getTypeColor(event.type)} text-white`}
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                          {userRole !== 'employee' && event.status === 'pending' && (
                            <Shield 
                              className="h-4 w-4 cursor-pointer hover:text-green-200"
                              onClick={() => handleApproval(event.id, 'approve')}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {getTypeIcon(event.type)}
                          <span className="text-sm">{event.title}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </TooltipProvider>
    );
  };

  const renderMonthView = () => {
    const weeks = eachWeekOfInterval(
      {
        start: startOfMonth(date),
        end: endOfMonth(date)
      },
      { locale: de }
    );

    return (
      <TooltipProvider>
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={onPrevMonth} 
              className="p-2 rounded hover:bg-gray-100"
            >
              &#8592; Vorheriger Monat
            </button>
            <h3 className="text-lg font-medium">
              {format(date, 'MMMM yyyy', { locale: de })}
            </h3>
            <button 
              onClick={onNextMonth} 
              className="p-2 rounded hover:bg-gray-100"
            >
              Nächster Monat &#8594;
            </button>
          </div>

          {/* Legende */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-200 rounded" />
              <span>Feiertag</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-200 rounded" />
              <span>Urlaubssperre</span>
            </div>
          </div>
          
          {weeks.map(week => (
            <div key={week.toISOString()} className="grid grid-cols-7 gap-4">
              {eachDayOfInterval({
                start: startOfWeek(week, { locale: de }),
                end: endOfWeek(week, { locale: de })
              }).map(day => {
                const holiday = isHoliday(day);
                const blackout = isBlackout(day);
                const isOtherMonth = format(day, 'MM') !== format(date, 'MM');
                
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => onDayClick && onDayClick(day)}
                    className={`min-h-[120px] p-2 rounded border cursor-pointer transition-colors ${
                      isOtherMonth
                        ? 'bg-gray-50'
                        : holiday
                        ? 'bg-amber-50 border-amber-200'
                        : blackout
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {format(day, 'd', { locale: de })}
                      </span>
                      {holiday && (
                        <Tooltip>
                          <TooltipTrigger>
                            <CalendarIcon className="h-3 w-3 text-amber-600" />
                          </TooltipTrigger>
                          <TooltipContent>{holiday.name}</TooltipContent>
                        </Tooltip>
                      )}
                      {blackout && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Ban className="h-3 w-3 text-red-600" />
                          </TooltipTrigger>
                          <TooltipContent>{blackout.reason}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="space-y-1">
                      {events
                        .filter(event =>
                          format(event.start, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                        )
                        .slice(0, 3)
                        .map(event => (
                          <div
                            key={event.id}
                            className={`p-1 rounded ${getTypeColor(event.type)} text-white text-xs`}
                          >
                            <div className="flex items-center gap-1">
                              {getTypeIcon(event.type)}
                              <span className="truncate">{event.title}</span>
                            </div>
                          </div>
                        ))}
                      {events.filter(event =>
                        format(event.start, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                      ).length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{events.filter(event =>
                            format(event.start, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                          ).length - 3} weitere
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </TooltipProvider>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
    </div>
  );
};

export default AbsenceCalendar;
