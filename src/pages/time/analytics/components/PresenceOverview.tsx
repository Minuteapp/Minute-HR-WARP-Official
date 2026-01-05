
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeEntry } from "@/types/time-tracking.types";
import { useTheme } from "next-themes";
import { HeatmapCalendar } from '@/components/ui/heatmap-calendar';
import { differenceInCalendarDays } from 'date-fns';

interface PresenceOverviewProps {
  data: TimeEntry[];
  dateRange: { from: Date; to: Date };
}

const PresenceOverview = ({ data, dateRange }: PresenceOverviewProps) => {
  const { theme } = useTheme();
  
  const preparePresenceData = () => {
    if (!data || data.length === 0) return [];
    
    // Erstelle ein Mapping aller Tage im Datumsbereich
    const dayCount = differenceInCalendarDays(dateRange.to, dateRange.from) + 1;
    const daysInRange: Record<string, number> = {};
    
    for (let i = 0; i < dayCount; i++) {
      const day = new Date(dateRange.from);
      day.setDate(dateRange.from.getDate() + i);
      const dateKey = day.toISOString().split('T')[0]; // YYYY-MM-DD
      daysInRange[dateKey] = 0;
    }
    
    // Fülle mit tatsächlichen Daten
    data.forEach(entry => {
      const day = new Date(entry.start_time).toISOString().split('T')[0];
      if (daysInRange[day] !== undefined) {
        const startTime = new Date(entry.start_time);
        const endTime = entry.end_time ? new Date(entry.end_time) : new Date();
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        // Pause abziehen
        const breakHours = entry.break_minutes ? entry.break_minutes / 60 : 0;
        daysInRange[day] += (durationHours - breakHours);
      }
    });
    
    // In Array für Heatmap-Kalender umwandeln
    return Object.entries(daysInRange).map(([date, hours]) => ({
      date,
      value: hours
    }));
  };
  
  const presenceData = preparePresenceData();

  // Berechne Statistiken
  const calculateStats = () => {
    const nonZeroDays = presenceData.filter(day => day.value > 0);
    
    const totalWorkHours = presenceData.reduce((sum, day) => sum + day.value, 0);
    const avgHoursPerWorkday = nonZeroDays.length > 0 
      ? totalWorkHours / nonZeroDays.length
      : 0;
    
    const workDays = nonZeroDays.length;
    const totalDays = presenceData.length;
    const workDaysPercentage = totalDays > 0 
      ? (workDays / totalDays) * 100
      : 0;
    
    return {
      totalWorkHours: totalWorkHours.toFixed(1),
      avgHoursPerWorkday: avgHoursPerWorkday.toFixed(1),
      workDays,
      totalDays,
      workDaysPercentage: workDaysPercentage.toFixed(0)
    };
  };
  
  const stats = calculateStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anwesenheitsübersicht</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <HeatmapCalendar
              data={presenceData}
              dateKey="date"
              valueKey="value"
              startDate={dateRange.from}
              endDate={dateRange.to}
              colorScheme={theme === 'dark' ? 'purpleDark' : 'purple'}
              showMonthLabels
              showWeekdayLabels
              customTooltip={({ value, date }: any) => (
                `${new Date(date).toLocaleDateString('de-DE')}: ${value.toFixed(1)} Stunden`
              )}
            />
          </div>
          
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-semibold text-primary">{stats.totalWorkHours} h</div>
                  <div className="text-sm text-muted-foreground">Gesamtarbeitszeit</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-semibold text-primary">{stats.avgHoursPerWorkday} h</div>
                  <div className="text-sm text-muted-foreground">Ø Stunden/Arbeitstag</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-semibold text-primary">{stats.workDays} Tage</div>
                  <div className="text-sm text-muted-foreground">Arbeitstage</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-semibold text-primary">{stats.workDaysPercentage}%</div>
                  <div className="text-sm text-muted-foreground">Anwesenheitsquote</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>
                Im ausgewählten Zeitraum wurden an {stats.workDays} von {stats.totalDays} Tagen
                Arbeitszeiten erfasst, was einer Quote von {stats.workDaysPercentage}% entspricht.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PresenceOverview;
