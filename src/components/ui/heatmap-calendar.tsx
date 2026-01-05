
import * as React from "react";
import { addDays, format, getDay, startOfWeek, subMonths, eachDayOfInterval, differenceInCalendarDays } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

type ColorScheme = 'blue' | 'purple' | 'green' | 'blueDark' | 'purpleDark' | 'greenDark';

interface HeatmapCalendarProps {
  data: Array<{ [key: string]: any }>;
  dateKey: string;
  valueKey: string;
  startDate?: Date;
  endDate?: Date;
  showMonthLabels?: boolean;
  showWeekdayLabels?: boolean;
  colorScheme?: ColorScheme;
  className?: string;
  customTooltip?: (data: any) => string;
}

const COLOR_SCHEMES = {
  blue: ['#f1f5f9', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6'],
  purple: ['#f5f3ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9b87f5'],
  green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e'],
  blueDark: ['#1e293b', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa'],
  purpleDark: ['#1e293b', '#5b21b6', '#7e22ce', '#9333ea', '#a855f7', '#c084fc'],
  greenDark: ['#1e293b', '#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80'],
};

export function HeatmapCalendar({
  data,
  dateKey,
  valueKey,
  startDate,
  endDate,
  showMonthLabels = false,
  showWeekdayLabels = false,
  colorScheme = 'blue',
  className,
  customTooltip,
}: HeatmapCalendarProps) {
  // Start- und Enddatum festlegen
  const today = new Date();
  const defaultStartDate = subMonths(today, 3);
  const actualStartDate = startDate || defaultStartDate;
  const actualEndDate = endDate || today;
  
  // Vorbereiten der Daten in einem Map für schnelleren Zugriff
  const valueMap = new Map();
  data.forEach(item => {
    valueMap.set(item[dateKey], item[valueKey]);
  });
  
  // Finden des maximalen Werts für die Farbskalierung
  const maxValue = Math.max(0.1, ...data.map(item => item[valueKey]));
  
  // Berechne alle Tage im Zeitraum
  const daysSinceStart = differenceInCalendarDays(actualEndDate, actualStartDate) + 1;
  
  // Berechne Anfangswochentag, damit wir die Kacheln korrekt ausrichten können
  const startOfFirstWeek = startOfWeek(actualStartDate, { locale: de });
  const dayOffset = differenceInCalendarDays(actualStartDate, startOfFirstWeek);

  // Generiere Tage als Array von Objekten mit Datum und Wert
  const days = eachDayOfInterval({ start: startOfFirstWeek, end: actualEndDate }).map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const value = valueMap.get(dateStr) || 0;
    const percentOfMax = value / maxValue;
    
    // Wähle Farbindex basierend auf Prozent des Maximalwerts (fünf Stufen)
    let colorIndex = 0;
    if (percentOfMax > 0) {
      colorIndex = Math.min(5, Math.ceil(percentOfMax * 5));
    }
    
    const colors = COLOR_SCHEMES[colorScheme];
    
    return {
      date,
      dateStr,
      value,
      dayOfWeek: getDay(date),
      color: colors[colorIndex],
      isInRange: differenceInCalendarDays(date, actualStartDate) >= 0
    };
  });
  
  // Berechne Monate für die Labels
  const months = [];
  let currentMonth = '';
  days.forEach((day, i) => {
    const monthStr = format(day.date, 'MMM', { locale: de });
    if (monthStr !== currentMonth) {
      months.push({ index: i, month: monthStr, date: day.date });
      currentMonth = monthStr;
    }
  });
  
  // Erzeuge 7 Wochentage für die Labels
  const weekdays = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(startOfFirstWeek, i);
    weekdays.push(format(date, 'EEE', { locale: de }));
  }
  
  return (
    <div className={cn("", className)}>
      <div className="relative flex">
        {/* Wochentag-Labels */}
        {showWeekdayLabels && (
          <div className="flex flex-col mr-2 text-xs text-muted-foreground mt-6">
            {weekdays.map((day, i) => (
              <div key={i} className="h-3 flex items-center justify-end">
                {day[0]}
              </div>
            ))}
          </div>
        )}
        
        <div className="relative flex flex-col overflow-hidden">
          {/* Monats-Labels */}
          {showMonthLabels && (
            <div className="flex mb-1 text-xs text-muted-foreground">
              {months.map((month, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 absolute"
                  style={{ left: `${(month.index * 12) / 7}px` }}
                >
                  {month.month}
                </div>
              ))}
            </div>
          )}
          
          {/* Haupt-Kalender-Grid */}
          <div className="grid grid-cols-[repeat(53,_12px)] grid-rows-7 gap-1">
            {days.map((day, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-sm",
                  !day.isInRange && "opacity-0"
                )}
                style={{ backgroundColor: day.isInRange ? day.color : 'transparent' }}
                data-tooltip-id="calendar-tooltip"
                data-tooltip-content={customTooltip ? customTooltip(day) : `${day.dateStr}: ${day.value}`}
                title={customTooltip ? customTooltip(day) : `${format(day.date, 'dd.MM.yyyy', { locale: de })}: ${day.value}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legende */}
      <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground">
        <span className="mr-1">Weniger</span>
        {COLOR_SCHEMES[colorScheme].map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm mx-[2px]"
            style={{ backgroundColor: color }}
          ></div>
        ))}
        <span className="ml-1">Mehr</span>
      </div>
    </div>
  );
}
