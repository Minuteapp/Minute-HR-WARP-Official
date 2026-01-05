
import { Card, CardContent } from "@/components/ui/card";
import { format, differenceInHours, differenceInMinutes, isThisWeek, isThisMonth } from "date-fns";
import { Clock, CalendarDays, TrendingUp } from "lucide-react";
import type { TimeEntry } from "@/types/time-tracking.types";

interface TimeStatCardsProps {
  timeEntries: TimeEntry[];
}

export const TimeStatCards = ({ timeEntries }: TimeStatCardsProps) => {
  // Berechne die Statistiken
  const calculateTotalHours = (entries: TimeEntry[]): number => {
    return entries.reduce((total, entry) => {
      if (!entry.end_time) return total;
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const durationInMinutes = differenceInMinutes(end, start) - (entry.break_minutes || 0);
      return total + durationInMinutes / 60;
    }, 0);
  };

  const thisWeekEntries = timeEntries.filter(entry => 
    isThisWeek(new Date(entry.start_time))
  );
  
  const thisMonthEntries = timeEntries.filter(entry => 
    isThisMonth(new Date(entry.start_time))
  );
  
  const weeklyHours = calculateTotalHours(thisWeekEntries);
  const monthlyHours = calculateTotalHours(thisMonthEntries);
  const totalHours = calculateTotalHours(timeEntries);

  // Letzte Buchung finden
  const lastEntry = timeEntries.length > 0 ? timeEntries[0] : null;
  const lastEntryFormatted = lastEntry 
    ? format(new Date(lastEntry.start_time), 'dd.MM.yyyy HH:mm')
    : 'Keine Einträge';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Diese Woche</p>
              <h3 className="text-2xl font-bold mt-1">{weeklyHours.toFixed(1)}h</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Dieser Monat</p>
              <h3 className="text-2xl font-bold mt-1">{monthlyHours.toFixed(1)}h</h3>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <CalendarDays className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Letzte Buchung</p>
              <h3 className="text-xl font-bold mt-1">{lastEntryFormatted}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
