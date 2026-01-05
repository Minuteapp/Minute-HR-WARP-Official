
import { TimeEntry } from '@/types/time-tracking.types';

export const useCalendarCalculations = (timeEntries: TimeEntry[] = []) => {
  const calculateHoursForDay = (date: Date) => {
    const entriesForDay = timeEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear()
      );
    });

    let totalHours = 0;
    entriesForDay.forEach(entry => {
      if (entry.end_time) {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        totalHours += diffHours - ((entry.break_minutes || 0) / 60);
      }
    });

    return totalHours;
  };

  const getDayClassNames = (date: Date) => {
    const hours = calculateHoursForDay(date);
    if (hours >= 8) return 'bg-green-100';
    if (hours > 0) return 'bg-yellow-50';
    return '';
  };

  return {
    calculateHoursForDay,
    getDayClassNames
  };
};
