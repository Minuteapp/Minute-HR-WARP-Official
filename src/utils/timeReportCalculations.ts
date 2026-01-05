import { TimeEntry } from '@/types/time-tracking.types';
import { startOfWeek, endOfWeek, format, parseISO, differenceInHours, getDay, getISOWeek } from 'date-fns';
import { de } from 'date-fns/locale';

export interface ReportStatistics {
  totalHours: number;
  targetHours: number;
  productivity: number;
  productivityChange: number;
  avgHoursPerDay: number;
  workDays: number;
  overtime: number;
}

export interface WeeklyData {
  week: string;
  hours: number;
  target: number;
}

export interface WeekdayData {
  day: string;
  hours: number;
}

export interface ProjectData {
  name: string;
  hours: number;
  percentage: number;
}

export interface LocationData {
  name: string;
  hours: number;
  percentage: number;
}

const calculateHoursFromEntry = (entry: TimeEntry): number => {
  if (!entry.start_time || !entry.end_time) return 0;
  
  const start = parseISO(entry.start_time);
  const end = parseISO(entry.end_time);
  const hours = differenceInHours(end, start);
  const breakHours = (entry.break_minutes || 0) / 60;
  
  return Math.max(0, hours - breakHours);
};

export const calculateTotalHours = (entries: TimeEntry[]): number => {
  return entries.reduce((sum, entry) => sum + calculateHoursFromEntry(entry), 0);
};

export const getWorkDays = (entries: TimeEntry[]): number => {
  const uniqueDays = new Set(
    entries.map(entry => format(parseISO(entry.start_time), 'yyyy-MM-dd'))
  );
  return uniqueDays.size;
};

export const getTargetHours = (period: string, workDays: number = 20): number => {
  switch (period) {
    case 'thisWeek':
    case 'lastWeek':
      return 40;
    case 'thisMonth':
    case 'lastMonth':
      return workDays * 8;
    case 'thisQuarter':
      return 480; // ~60 Arbeitstage * 8h
    default:
      return 160;
  }
};

export const calculateStatistics = (entries: TimeEntry[], period: string): ReportStatistics => {
  const totalHours = calculateTotalHours(entries);
  const workDays = getWorkDays(entries);
  const targetHours = getTargetHours(period, workDays);
  const productivity = targetHours > 0 ? (totalHours / targetHours) * 100 : 0;
  const avgHoursPerDay = workDays > 0 ? totalHours / workDays : 0;
  const overtime = totalHours - targetHours;
  
  // Produktivitätsänderung (Mock-Wert, sollte mit historischen Daten verglichen werden)
  const productivityChange = 3;
  
  return {
    totalHours,
    targetHours,
    productivity,
    productivityChange,
    avgHoursPerDay,
    workDays,
    overtime
  };
};

export const groupByWeek = (entries: TimeEntry[]): WeeklyData[] => {
  const weekMap = new Map<number, number>();
  
  entries.forEach(entry => {
    if (!entry.start_time) return;
    const date = parseISO(entry.start_time);
    const weekNum = getISOWeek(date);
    const hours = calculateHoursFromEntry(entry);
    
    weekMap.set(weekNum, (weekMap.get(weekNum) || 0) + hours);
  });
  
  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([week, hours]) => ({
      week: `KW ${week}`,
      hours: Math.round(hours * 10) / 10,
      target: 40
    }));
};

export const groupByWeekday = (entries: TimeEntry[]): WeekdayData[] => {
  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const dayMap = new Map<number, { total: number; count: number }>();
  
  entries.forEach(entry => {
    if (!entry.start_time) return;
    const date = parseISO(entry.start_time);
    const dayNum = getDay(date);
    const hours = calculateHoursFromEntry(entry);
    
    const current = dayMap.get(dayNum) || { total: 0, count: 0 };
    dayMap.set(dayNum, {
      total: current.total + hours,
      count: current.count + 1
    });
  });
  
  // Nur Montag bis Freitag
  return [1, 2, 3, 4, 5].map(dayNum => ({
    day: dayNames[dayNum],
    hours: Math.round((dayMap.get(dayNum)?.total || 0) / (dayMap.get(dayNum)?.count || 1) * 10) / 10
  }));
};

export const groupByProject = (entries: TimeEntry[]): ProjectData[] => {
  const projectMap = new Map<string, number>();
  
  entries.forEach(entry => {
    const project = entry.project || 'Ohne Projekt';
    const hours = calculateHoursFromEntry(entry);
    projectMap.set(project, (projectMap.get(project) || 0) + hours);
  });
  
  const total = Array.from(projectMap.values()).reduce((sum, h) => sum + h, 0);
  
  return Array.from(projectMap.entries())
    .map(([name, hours]) => ({
      name,
      hours: Math.round(hours * 10) / 10,
      percentage: total > 0 ? Math.round((hours / total) * 100) : 0
    }))
    .sort((a, b) => b.hours - a.hours);
};

export const groupByLocation = (entries: TimeEntry[]): LocationData[] => {
  const locationMap = new Map<string, number>();
  
  entries.forEach(entry => {
    const location = entry.location || 'Unbekannt';
    const hours = calculateHoursFromEntry(entry);
    locationMap.set(location, (locationMap.get(location) || 0) + hours);
  });
  
  const total = Array.from(locationMap.values()).reduce((sum, h) => sum + h, 0);
  
  return Array.from(locationMap.entries())
    .map(([name, hours]) => ({
      name,
      hours: Math.round(hours * 10) / 10,
      percentage: total > 0 ? Math.round((hours / total) * 100) : 0
    }))
    .sort((a, b) => b.hours - a.hours);
};

export const analyzeMostProductiveDay = (entries: TimeEntry[]): { day: string; hours: number } => {
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const dayMap = new Map<number, { total: number; count: number }>();
  
  entries.forEach(entry => {
    if (!entry.start_time) return;
    const date = parseISO(entry.start_time);
    const dayNum = getDay(date);
    const hours = calculateHoursFromEntry(entry);
    
    const current = dayMap.get(dayNum) || { total: 0, count: 0 };
    dayMap.set(dayNum, {
      total: current.total + hours,
      count: current.count + 1
    });
  });
  
  let maxDay = 0;
  let maxAvg = 0;
  
  dayMap.forEach((data, dayNum) => {
    const avg = data.total / data.count;
    if (avg > maxAvg) {
      maxAvg = avg;
      maxDay = dayNum;
    }
  });
  
  return {
    day: dayNames[maxDay],
    hours: Math.round(maxAvg * 10) / 10
  };
};

export const analyzeMostCommonStartTime = (entries: TimeEntry[]): { time: string; percentage: number } => {
  const timeMap = new Map<string, number>();
  
  entries.forEach(entry => {
    if (!entry.start_time) return;
    const date = parseISO(entry.start_time);
    const hourStr = format(date, 'HH:00');
    timeMap.set(hourStr, (timeMap.get(hourStr) || 0) + 1);
  });
  
  let maxTime = '08:00';
  let maxCount = 0;
  
  timeMap.forEach((count, time) => {
    if (count > maxCount) {
      maxCount = count;
      maxTime = time;
    }
  });
  
  const percentage = entries.length > 0 ? Math.round((maxCount / entries.length) * 100) : 0;
  
  return { time: maxTime + ' Uhr', percentage };
};
