
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  format, 
  parseISO, 
  differenceInMinutes 
} from "date-fns";
import { de } from "date-fns/locale";
import { Clock, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { TimeEntry } from "@/types/time-tracking.types";
import { Skeleton } from "@/components/ui/skeleton";

const TimeTrackingOverview = () => {
  const { user } = useAuth();
  
  // Zeiträume bestimmen
  const today = new Date();
  const thisWeekStart = startOfWeek(today, { locale: de });
  const thisWeekEnd = endOfWeek(today, { locale: de });
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);
  
  const lastMonthEnd = startOfMonth(today);
  lastMonthEnd.setDate(lastMonthEnd.getDate() - 1);
  const lastMonthStart = startOfMonth(lastMonthEnd);
  
  // Wochendaten abfragen
  const { data: weeklyTimeEntries, isLoading: weekLoading } = useQuery({
    queryKey: ['weeklyTimeEntriesOverview', user?.id, format(thisWeekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', thisWeekStart.toISOString())
        .lte('start_time', thisWeekEnd.toISOString());
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Monatsdaten abfragen
  const { data: monthlyTimeEntries, isLoading: monthLoading } = useQuery({
    queryKey: ['monthlyTimeEntriesOverview', user?.id, format(thisMonthStart, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', thisMonthStart.toISOString())
        .lte('start_time', thisMonthEnd.toISOString());
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Vormonatsdaten abfragen für Vergleich
  const { data: lastMonthTimeEntries, isLoading: lastMonthLoading } = useQuery({
    queryKey: ['lastMonthTimeEntriesOverview', user?.id, format(lastMonthStart, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', lastMonthStart.toISOString())
        .lte('start_time', lastMonthEnd.toISOString());
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Arbeitszeitmodell-Daten abfragen
  const { data: userModel } = useQuery({
    queryKey: ['arbeitszeitModellOverview', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mitarbeiter_arbeitszeitmodelle')
        .select(`
          *,
          arbeitszeit_modelle(*)
        `)
        .eq('employee_id', user?.id)
        .order('gültig_ab', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });
  
  // Berechnung der Wochenarbeitsstunden
  const calculateWeeklyHours = () => {
    if (!weeklyTimeEntries) return 0;
    
    let totalMinutes = 0;
    
    weeklyTimeEntries.forEach((entry: TimeEntry) => {
      if (entry.end_time) {
        const startTime = parseISO(entry.start_time);
        const endTime = parseISO(entry.end_time);
        const breakMinutes = entry.break_minutes || 0;
        
        totalMinutes += differenceInMinutes(endTime, startTime) - breakMinutes;
      }
    });
    
    return totalMinutes / 60;
  };
  
  // Berechnung der Monatsarbeitsstunden
  const calculateMonthlyHours = () => {
    if (!monthlyTimeEntries) return 0;
    
    let totalMinutes = 0;
    
    monthlyTimeEntries.forEach((entry: TimeEntry) => {
      if (entry.end_time) {
        const startTime = parseISO(entry.start_time);
        const endTime = parseISO(entry.end_time);
        const breakMinutes = entry.break_minutes || 0;
        
        totalMinutes += differenceInMinutes(endTime, startTime) - breakMinutes;
      }
    });
    
    return totalMinutes / 60;
  };
  
  // Berechnung der Vormonatsarbeitsstunden
  const calculateLastMonthHours = () => {
    if (!lastMonthTimeEntries) return 0;
    
    let totalMinutes = 0;
    
    lastMonthTimeEntries.forEach((entry: TimeEntry) => {
      if (entry.end_time) {
        const startTime = parseISO(entry.start_time);
        const endTime = parseISO(entry.end_time);
        const breakMinutes = entry.break_minutes || 0;
        
        totalMinutes += differenceInMinutes(endTime, startTime) - breakMinutes;
      }
    });
    
    return totalMinutes / 60;
  };
  
  // Berechnung der Überstunden (basierend auf Wochenstundenzahl aus Arbeitszeitmodell)
  const calculateOvertimeHours = () => {
    const weeklyHours = calculateWeeklyHours();
    const targetHours = userModel?.wochenstunden || 40;
    
    // Anteilige Sollstunden für die aktuelle Woche
    const dayOfWeek = today.getDay() || 7; // 0 = Sonntag, 1-6 = Mo-Sa
    const workWeekDaysPassed = Math.min(dayOfWeek, 5); // Max 5 Arbeitstage pro Woche
    const proportionalTarget = (targetHours / 5) * workWeekDaysPassed;
    
    return weeklyHours - proportionalTarget;
  };
  
  const isLoading = weekLoading || monthLoading || lastMonthLoading;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>
    );
  }
  
  const weeklyHours = calculateWeeklyHours();
  const monthlyHours = calculateMonthlyHours();
  const lastMonthHours = calculateLastMonthHours();
  const overtimeHours = calculateOvertimeHours();
  
  // Monatliche Veränderung in Prozent
  const monthlyChange = lastMonthHours > 0 
    ? ((monthlyHours - lastMonthHours) / lastMonthHours) * 100 
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Diese Woche
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weeklyHours.toFixed(1)}h</div>
          <p className="text-xs text-muted-foreground">
            {format(thisWeekStart, 'dd.MM.', { locale: de })} - {format(thisWeekEnd, 'dd.MM.yyyy', { locale: de })}
          </p>
          <div className="mt-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Sollzeit:</p>
                <p>{userModel?.wochenstunden || 40}h</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Überstunden:</p>
                <p className={`${overtimeHours >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {overtimeHours >= 0 ? '+' : ''}{overtimeHours.toFixed(1)}h
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Dieser Monat
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyHours.toFixed(1)}h</div>
          <p className="text-xs text-muted-foreground">
            {format(thisMonthStart, 'MMMM yyyy', { locale: de })}
          </p>
          <div className="mt-4 h-4 w-full">
            <div className="flex items-center">
              <span className="text-sm">
                {Math.abs(monthlyChange).toFixed(1)}% 
              </span>
              <span className="mx-2 text-xs text-muted-foreground">
                zum Vormonat
              </span>
              {monthlyChange > 0 ? (
                <ArrowUp className="h-4 w-4 text-green-500" />
              ) : monthlyChange < 0 ? (
                <ArrowDown className="h-4 w-4 text-red-500" />
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Arbeitszeitmodell
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {userModel?.arbeitszeit_modelle?.name || 'Gleitzeit'}
          </div>
          <p className="text-xs text-muted-foreground">
            {userModel?.wochenstunden || 40} Stunden/Woche
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Tägliche Sollzeit:</p>
              <p>{((userModel?.wochenstunden || 40) / 5).toFixed(1)}h</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gültig seit:</p>
              <p>
                {userModel?.gültig_ab 
                  ? format(parseISO(userModel.gültig_ab), 'dd.MM.yyyy', { locale: de })
                  : 'Immer'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackingOverview;
