import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Coffee, MapPin, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInMinutes, startOfDay, addMinutes, isAfter } from "date-fns";
import { de } from "date-fns/locale";

interface TimelineEvent {
  time: Date;
  type: 'start' | 'break' | 'end' | 'required_break' | 'max_work_time' | 'location';
  title: string;
  description?: string;
  location?: string;
  duration?: number;
  isCompleted: boolean;
  isRequired: boolean;
  severity?: 'info' | 'warning' | 'error';
}

interface TimeTrackingTimelineProps {
  activeEntry: any;
  totalBreakTime: number;
  workingMinutes: number;
  currentPausedTime?: number;
}

const TimeTrackingTimeline = ({ activeEntry, totalBreakTime, workingMinutes, currentPausedTime = 0 }: TimeTrackingTimelineProps) => {
  const { user } = useAuth();

  // Hole alle heutigen Zeiteinträge
  const { data: todayEntries = [] } = useQuery({
    queryKey: ['todayTimeEntriesTimeline', user?.id],
    queryFn: async () => {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', startOfToday.toISOString())
        .lt('start_time', endOfToday.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Erstelle Timeline-Events
  const createTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const now = new Date();

    // 1. Alle tatsächlichen Zeiteinträge hinzufügen
    todayEntries.forEach((entry, index) => {
      const startTime = new Date(entry.start_time);
      const endTime = entry.end_time ? new Date(entry.end_time) : now;
      
      // Start-Event
      events.push({
        time: startTime,
        type: 'start',
        title: `Arbeitsbeginn ${index + 1}`,
        description: entry.project !== 'none' ? `Projekt: ${entry.project}` : 'Allgemeine Arbeit',
        location: entry.location,
        isCompleted: true,
        isRequired: false,
        severity: 'info'
      });

      // Location-Event
      if (entry.location) {
        events.push({
          time: startTime,
          type: 'location',
          title: 'Standort erfasst',
          description: entry.location,
          location: entry.location,
          isCompleted: true,
          isRequired: false,
          severity: 'info'
        });
      }

      // End-Event (falls vorhanden)
      if (entry.end_time) {
        events.push({
          time: endTime,
          type: 'end',
          title: `Arbeitsende ${index + 1}`,
          description: `Dauer: ${Math.floor(differenceInMinutes(endTime, startTime) / 60)}:${String(differenceInMinutes(endTime, startTime) % 60).padStart(2, '0')} Stunden`,
          isCompleted: true,
          isRequired: false,
          severity: 'info'
        });
      }
    });

    // 2. Gesetzlich vorgeschriebene Pausen hinzufügen
    if (activeEntry) {
      const startTime = new Date(activeEntry.start_time);
      
      // Nach 6 Stunden: 30 Min Pause erforderlich
      const sixHourMark = addMinutes(startTime, 6 * 60);
      // Berücksichtige sowohl beendete Pausen als auch aktuelle Pausenzeit
      const effectiveBreakTime = totalBreakTime + Math.floor(currentPausedTime / 60);
      const breakTaken = effectiveBreakTime >= 30; // 30 Min in Minuten
      
      events.push({
        time: sixHourMark,
        type: 'required_break',
        title: 'Gesetzliche Pause erforderlich',
        description: '30 Minuten Pause nach 6 Stunden Arbeit',
        duration: 30,
        isCompleted: breakTaken,
        isRequired: true,
        severity: workingMinutes >= 6 * 60 && !breakTaken ? 'warning' : 'info'
      });

      // Nach 9 Stunden: Weitere 15 Min Pause
      if (workingMinutes >= 9 * 60) {
        const nineHourMark = addMinutes(startTime, 9 * 60);
        const extendedBreakTaken = effectiveBreakTime >= 45; // 45 Min total
        
        events.push({
          time: nineHourMark,
          type: 'required_break',
          title: 'Zusätzliche Pause erforderlich',
          description: '15 Minuten zusätzliche Pause nach 9 Stunden',
          duration: 15,
          isCompleted: extendedBreakTaken,
          isRequired: true,
          severity: !extendedBreakTaken ? 'error' : 'info'
        });
      }

      // Maximale Arbeitszeit (10 Stunden)
      const maxWorkTime = addMinutes(startTime, 10 * 60);
      events.push({
        time: maxWorkTime,
        type: 'max_work_time',
        title: 'Maximale Arbeitszeit erreicht',
        description: 'Gesetzliches Maximum von 10 Stunden Arbeitszeit',
        isCompleted: false,
        isRequired: true,
        severity: workingMinutes >= 10 * 60 ? 'error' : 'warning'
      });
    }

    // 3. Pausenzeiten hinzufügen (geschätzt basierend auf break_minutes und aktueller Pausenzeit)
    const effectiveTotalBreakTime = totalBreakTime + Math.floor(currentPausedTime / 60);
    if (effectiveTotalBreakTime > 0) {
      // Vereinfachte Darstellung: Eine große Pause
      const firstEntry = todayEntries[0];
      if (firstEntry) {
        const estimatedBreakTime = addMinutes(new Date(firstEntry.start_time), 4 * 60); // Nach 4 Stunden schätzen
        events.push({
          time: estimatedBreakTime,
          type: 'break',
          title: 'Pause genommen',
          description: `${effectiveTotalBreakTime} Minuten Pause${currentPausedTime > 0 ? ' (inkl. aktueller Pause)' : ''}`,
          duration: effectiveTotalBreakTime,
          isCompleted: true,
          isRequired: false,
          severity: 'info'
        });
      }
    }

    // Sortiere Events nach Zeit
    return events.sort((a, b) => a.time.getTime() - b.time.getTime());
  };

  const events = createTimelineEvents();

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'start':
        return <Clock className="h-4 w-4" />;
      case 'break':
      case 'required_break':
        return <Coffee className="h-4 w-4" />;
      case 'end':
        return <CheckCircle className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'max_work_time':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (event: TimelineEvent) => {
    if (event.severity === 'error') return 'text-red-600 bg-red-50 border-red-200';
    if (event.severity === 'warning') return 'text-orange-600 bg-orange-50 border-orange-200';
    if (event.isCompleted) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getBadgeVariant = (event: TimelineEvent): "default" | "secondary" | "destructive" | "outline" => {
    if (event.severity === 'error') return 'destructive';
    if (event.severity === 'warning') return 'secondary';
    if (event.isCompleted) return 'default';
    return 'outline';
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Arbeitszeit-Zeitstrahl
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Überblick über Ihre heutige Arbeitszeit mit gesetzlichen Anforderungen
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Keine Zeiterfassung für heute vorhanden</p>
            </div>
          ) : (
            <>
              {/* Zusammenfassung */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.floor(workingMinutes / 60)}:{String(workingMinutes % 60).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-muted-foreground">Arbeitszeit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {totalBreakTime + Math.floor(currentPausedTime / 60)}
                  </div>
                  <div className="text-xs text-muted-foreground">Min. Pause</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.max(0, workingMinutes >= 6 * 60 ? 30 - (totalBreakTime + Math.floor(currentPausedTime / 60)) : 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Min. fehlen</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {Math.max(0, 10 * 60 - workingMinutes)}
                  </div>
                  <div className="text-xs text-muted-foreground">Min. bis Max</div>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
                <div className="space-y-6">
                  {events.map((event, index) => (
                    <div key={index} className="relative flex items-start gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getEventColor(event)}`}>
                        {getEventIcon(event)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium">{event.title}</h4>
                          {event.isRequired && (
                            <Badge variant={getBadgeVariant(event)} className="text-xs">
                              {event.isCompleted ? 'Erfüllt' : 'Erforderlich'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {format(event.time, 'HH:mm', { locale: de })} Uhr
                        </p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}
                        {event.location && event.type === 'location' && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTrackingTimeline;