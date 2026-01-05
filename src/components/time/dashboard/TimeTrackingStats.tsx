
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  format,
  parseISO,
  differenceInMinutes
} from "date-fns";
import { de } from "date-fns/locale";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Line,
  LineChart
} from "recharts";
import { TimeEntry } from "@/types/time-tracking.types";
import { Skeleton } from "@/components/ui/skeleton";

type ChartDatum = {
  date: string;
  displayDate: string;
  hours: number;
  maxHours: number;
  pauseMinutes: number;
  absenceType?: string;
};

const TimeTrackingStats = () => {
  const { user } = useAuth();
  
  // Zeiträume bestimmen
  const today = new Date();
  const thisWeekStart = startOfWeek(today, { locale: de });
  const thisWeekEnd = endOfWeek(today, { locale: de });
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);
  
  // Wochendaten abfragen
  const { data: weeklyTimeEntries, isLoading: weekLoading } = useQuery({
    queryKey: ['weeklyTimeEntries', user?.id, format(thisWeekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', thisWeekStart.toISOString())
        .lte('start_time', thisWeekEnd.toISOString())
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Monatsdaten abfragen
  const { data: monthlyTimeEntries, isLoading: monthLoading } = useQuery({
    queryKey: ['monthlyTimeEntries', user?.id, format(thisMonthStart, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', thisMonthStart.toISOString())
        .lte('start_time', thisMonthEnd.toISOString())
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Abwesenheiten abfragen
  const { data: absences, isLoading: absencesLoading } = useQuery({
    queryKey: ['monthlyAbsences', user?.id, format(thisMonthStart, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('absences')
        .select('*')
        .eq('user_id', user?.id)
        .or(`start_date.lte.${thisMonthEnd.toISOString()},end_date.gte.${thisMonthStart.toISOString()}`)
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Wochendaten aufbereiten
  const prepareWeeklyData = (): ChartDatum[] => {
    const days = eachDayOfInterval({ start: thisWeekStart, end: thisWeekEnd });
    
    return days.map(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      
      // Zeiteinträge für diesen Tag filtern
      const dayEntries = weeklyTimeEntries?.filter((entry: TimeEntry) => {
        const entryDate = format(parseISO(entry.start_time), 'yyyy-MM-dd');
        return entryDate === formattedDate;
      }) || [];
      
      // Arbeitsstunden berechnen
      let totalMinutes = 0;
      let totalPauseMinutes = 0;
      
      dayEntries.forEach((entry: TimeEntry) => {
        if (entry.end_time) {
          const startTime = parseISO(entry.start_time);
          const endTime = parseISO(entry.end_time);
          const breakMinutes = entry.break_minutes || 0;
          
          totalMinutes += differenceInMinutes(endTime, startTime);
          totalPauseMinutes += breakMinutes;
        }
      });
      
      // Abwesenheiten prüfen
      const absence = absences?.find(abs => {
        const absStartDate = parseISO(abs.start_date);
        const absEndDate = parseISO(abs.end_date);
        return day >= absStartDate && day <= absEndDate;
      });
      
      return {
        date: formattedDate,
        displayDate: format(day, 'E', { locale: de }),
        hours: (totalMinutes - totalPauseMinutes) / 60,
        maxHours: 8, // Standardarbeitszeit
        pauseMinutes: totalPauseMinutes,
        absenceType: absence?.type
      };
    });
  };
  
  // Monatsdaten aufbereiten
  const prepareMonthlyData = (): { weekNumber: number; totalHours: number; overHours: number; }[] => {
    if (!monthlyTimeEntries || monthlyTimeEntries.length === 0) return [];
    
    const weekMap = new Map<number, { totalHours: number; overHours: number }>();
    
    monthlyTimeEntries.forEach((entry: TimeEntry) => {
      if (!entry.end_time) return;
      
      const startTime = parseISO(entry.start_time);
      const endTime = parseISO(entry.end_time);
      const breakMinutes = entry.break_minutes || 0;
      
      const weekNumber = parseInt(format(startTime, 'w'));
      const entryHours = (differenceInMinutes(endTime, startTime) - breakMinutes) / 60;
      
      // Überstunden berechnen (über 8h pro Tag)
      const overHours = Math.max(0, entryHours - 8);
      
      if (!weekMap.has(weekNumber)) {
        weekMap.set(weekNumber, { totalHours: 0, overHours: 0 });
      }
      
      const weekData = weekMap.get(weekNumber)!;
      weekMap.set(weekNumber, {
        totalHours: weekData.totalHours + entryHours,
        overHours: weekData.overHours + overHours
      });
    });
    
    // Sortierte Wochen als Array zurückgeben
    return Array.from(weekMap.entries())
      .map(([weekNumber, data]) => ({ 
        weekNumber, 
        totalHours: data.totalHours, 
        overHours: data.overHours 
      }))
      .sort((a, b) => a.weekNumber - b.weekNumber);
  };
  
  const isLoading = weekLoading || monthLoading || absencesLoading;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }
  
  const weeklyData = prepareWeeklyData();
  const monthlyData = prepareMonthlyData();
  
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Wochenübersicht</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                fontSize={12}
              />
              <YAxis
                tickFormatter={(value) => `${value}h`}
                domain={[0, 'dataMax + 1']}
                fontSize={12}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)}h`, 'Arbeitszeit']}
                labelFormatter={(label) => {
                  const day = weeklyData.find(d => d.displayDate === label);
                  if (day?.absenceType) {
                    return `${label} (${day.absenceType})`;
                  }
                  return label;
                }}
              />
              <Legend />
              <Bar
                dataKey="hours"
                name="Arbeitszeit"
                fill="#9b87f5"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="maxHours"
                name="Sollzeit"
                fill="#dbd4fb"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Monatsübersicht</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="weekNumber" 
                fontSize={12}
                tickFormatter={(value) => `KW ${value}`}
              />
              <YAxis
                tickFormatter={(value) => `${value}h`}
                domain={[0, 'dataMax + 5']}
                fontSize={12}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)}h`, '']}
                labelFormatter={(label) => `Kalenderwoche ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalHours" 
                name="Gesamtstunden" 
                stroke="#9b87f5" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="overHours" 
                name="Überstunden" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackingStats;
