import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Calendar } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';

interface TimeEntry {
  start_time: string;
  end_time?: string;
  break_minutes?: number;
}

interface WeekOverviewCardProps {
  timeEntries: TimeEntry[];
  targetHoursPerDay?: number;
}

export const WeekOverviewCard = ({ timeEntries, targetHoursPerDay = 8 }: WeekOverviewCardProps) => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
  
  const calculateDayHours = (date: Date) => {
    const dayEntries = timeEntries.filter(entry => 
      isSameDay(new Date(entry.start_time), date)
    );
    
    if (dayEntries.length === 0) return { hours: 0, startTime: '', endTime: '', isCompleted: false };
    
    let totalMinutes = 0;
    let earliestStart = '';
    let latestEnd = '';
    
    dayEntries.forEach(entry => {
      if (entry.end_time) {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
        const breakMinutes = entry.break_minutes || 0;
        totalMinutes += (minutes - breakMinutes);
        
        if (!earliestStart || entry.start_time < earliestStart) {
          earliestStart = entry.start_time;
        }
        if (!latestEnd || entry.end_time > latestEnd) {
          latestEnd = entry.end_time;
        }
      }
    });
    
    const hours = totalMinutes / 60;
    const startTime = earliestStart ? format(new Date(earliestStart), 'HH:mm', { locale: de }) : '';
    const endTime = latestEnd ? format(new Date(latestEnd), 'HH:mm', { locale: de }) : '';
    
    return { 
      hours: Math.round(hours * 10) / 10, 
      startTime, 
      endTime,
      isCompleted: hours >= targetHoursPerDay 
    };
  };

  const weekData = weekDays.map((day, index) => {
    const date = addDays(weekStart, index);
    const { hours, startTime, endTime, isCompleted } = calculateDayHours(date);
    
    return {
      day,
      date,
      hours,
      startTime,
      endTime,
      isCompleted
    };
  });

  const totalWeekHours = weekData.reduce((sum, day) => sum + day.hours, 0);
  const targetWeekHours = targetHoursPerDay * 5;
  const difference = totalWeekHours - targetWeekHours;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          Aktuelle Woche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {weekData.map((day) => (
            <div 
              key={day.day} 
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold w-8">{day.day}</span>
                {day.hours > 0 ? (
                  <span className="text-sm text-muted-foreground">
                    {day.startTime} - {day.endTime}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {day.hours > 0 ? (
                  <>
                    <span className="text-sm font-medium">{day.hours}h</span>
                    {day.isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Wochensumme</span>
            <span className="text-lg font-bold">{totalWeekHours.toFixed(1)}h</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Soll: {targetWeekHours}h</span>
            <span className={difference >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              Differenz: {difference >= 0 ? '+' : ''}{difference.toFixed(1)}h
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
