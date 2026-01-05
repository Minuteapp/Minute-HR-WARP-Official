import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  MapPin,
  AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, subDays, parseISO } from "date-fns";
import { de } from "date-fns/locale";

interface TimeTrackingTabContentProps {
  employeeId: string;
}

export const TimeTrackingTabContent = ({ employeeId }: TimeTrackingTabContentProps) => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const sevenDaysAgo = subDays(today, 7);

  // Fetch time entries for current week
  const { data: weekEntries = [], isLoading: weekLoading } = useQuery({
    queryKey: ['employee-time-week', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', employeeId)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // Fetch time entries for history (last 7 days)
  const { data: historyEntries = [], isLoading: historyLoading } = useQuery({
    queryKey: ['employee-time-history', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', employeeId)
        .gte('start_time', sevenDaysAgo.toISOString())
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // Fetch project time entries for current month
  const { data: projectEntries = [], isLoading: projectLoading } = useQuery({
    queryKey: ['employee-project-time', employeeId],
    queryFn: async () => {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const { data, error } = await supabase
        .from('time_entries')
        .select('*, projects:project_id (name)')
        .eq('user_id', employeeId)
        .gte('start_time', monthStart.toISOString())
        .not('project_id', 'is', null)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // Calculate week data
  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const currentWeek = weekDays.map((day, index) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + index);
    
    const dayEntries = weekEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      return entryDate.toDateString() === dayDate.toDateString();
    });

    const totalMinutes = dayEntries.reduce((sum, entry) => {
      if (entry.start_time && entry.end_time) {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    const firstEntry = dayEntries[0];
    const lastEntry = dayEntries[dayEntries.length - 1];
    const timeRange = firstEntry && lastEntry?.end_time
      ? `${format(new Date(firstEntry.start_time), 'HH:mm')} - ${format(new Date(lastEntry.end_time), 'HH:mm')}`
      : '-';

    return {
      day,
      hours: timeRange,
      total: totalMinutes > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` : '-',
      completed: dayDate < today && totalMinutes > 0,
    };
  });

  const weekTotal = weekEntries.reduce((sum, entry) => {
    if (entry.start_time && entry.end_time) {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }
    return sum;
  }, 0);

  const targetWeek = 40;
  const weekDifference = weekTotal - targetWeek;

  // Calculate project tracking
  const projectMap = projectEntries.reduce((acc, entry) => {
    const projectName = entry.projects?.name || 'Unbekanntes Projekt';
    if (!acc[projectName]) {
      acc[projectName] = { name: projectName, hours: 0 };
    }
    if (entry.start_time && entry.end_time) {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      acc[projectName].hours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }
    return acc;
  }, {} as Record<string, { name: string; hours: number }>);

  const projectValues = Object.values(projectMap) as { name: string; hours: number }[];
  const projectTracking = projectValues.map(project => {
    const totalMonthHours = projectValues.reduce((sum, p) => sum + p.hours, 0);
    return {
      name: project.name,
      hours: `${Math.round(project.hours)}h`,
      progress: totalMonthHours > 0 ? Math.round((project.hours / totalMonthHours) * 100) : 0,
    };
  });

  // Format check-in history
  const checkInHistory = historyEntries
    .filter(entry => entry.end_time)
    .slice(0, 5)
    .map(entry => {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time!);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return {
        date: format(start, 'dd.MM.yyyy', { locale: de }),
        checkIn: format(start, 'HH:mm'),
        checkOut: format(end, 'HH:mm'),
        hours: `${hours.toFixed(1)}h`,
        location: entry.location || 'Büro',
      };
    });

  const isLoading = weekLoading || historyLoading || projectLoading;

  if (isLoading) {
    return (
      <div className="bg-background p-6 rounded-lg border shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasData = weekEntries.length > 0 || historyEntries.length > 0;

  return (
    <div className="bg-background p-6 rounded-lg border shadow-sm space-y-6">
      {/* Top Section - Current Week & Overtime */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Week */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Aktuelle Woche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentWeek.slice(0, 5).map((day, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium w-6">{day.day}</span>
                  <span className="text-sm text-muted-foreground">{day.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{day.total}</span>
                  {day.completed && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
            ))}

            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Wochensumme</span>
                <span className="text-lg font-bold">{weekTotal.toFixed(1)}h</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Soll: {targetWeek}h • Differenz: {weekDifference > 0 ? '+' : ''}{weekDifference.toFixed(1)}h
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Overtime & Time Account */}
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Überstunden & Zeitkonto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Aktuelles Zeitkonto</p>
              <div className="text-4xl font-bold mb-2">
                {weekDifference > 0 ? '+' : ''}{weekDifference.toFixed(1)}h
              </div>
              <p className="text-sm text-muted-foreground">
                Zeitkorridor: -10h bis +10h
              </p>
              <Progress value={50 + (weekDifference / 20) * 50} className="h-2 mt-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Diese Woche</p>
                <p className="text-lg font-bold">{weekTotal.toFixed(1)}h</p>
              </div>
              <div className="bg-background p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Ziel</p>
                <p className="text-lg font-bold">{targetWeek}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Time Tracking */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Projektzeiterfassung ({format(today, 'MMMM yyyy', { locale: de })})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projectTracking.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Keine Projektzeiten in diesem Monat</p>
            </div>
          ) : (
            <>
              {projectTracking.map((project, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{project.name}</span>
                      <Badge variant="secondary" className="text-xs">{project.progress}%</Badge>
                    </div>
                    <span className="text-sm font-semibold">{project.hours}</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              ))}

              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Gesamt (Monat)</span>
                  <span className="text-lg font-bold">
                    {Math.round(projectValues.reduce((sum, p) => sum + p.hours, 0))}h
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Check-In/Out History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Check-In/Out Historie (Letzte 7 Tage)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checkInHistory.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Keine Zeiteinträge in den letzten 7 Tagen</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Datum</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Check-In</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Check-Out</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Stunden</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Standort</th>
                  </tr>
                </thead>
                <tbody>
                  {checkInHistory.map((entry, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 text-sm">{entry.date}</td>
                      <td className="py-3 text-sm">{entry.checkIn}</td>
                      <td className="py-3 text-sm">{entry.checkOut}</td>
                      <td className="py-3 text-sm font-semibold">{entry.hours}</td>
                      <td className="py-3">
                        <Badge 
                          variant="outline"
                          className={entry.location === 'Remote' ? 'bg-purple-50 dark:bg-purple-950' : 'bg-blue-50 dark:bg-blue-950'}
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {entry.location}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
