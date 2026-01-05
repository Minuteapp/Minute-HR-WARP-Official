import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, getISOWeek, getYear } from 'date-fns';

export type TimeRange = 'next_14_days' | 'this_week' | 'this_month' | 'custom';

export const getDateRange = (range: TimeRange) => {
  const today = new Date();
  
  switch (range) {
    case 'next_14_days':
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: addDays(today, 14).toISOString().split('T')[0],
      };
    case 'this_week':
      return {
        startDate: startOfWeek(today, { weekStartsOn: 1 }).toISOString().split('T')[0],
        endDate: endOfWeek(today, { weekStartsOn: 1 }).toISOString().split('T')[0],
      };
    case 'this_month':
      return {
        startDate: startOfMonth(today).toISOString().split('T')[0],
        endDate: endOfMonth(today).toISOString().split('T')[0],
      };
    default:
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: addDays(today, 30).toISOString().split('T')[0],
      };
  }
};

export const groupShiftsByWeek = (shifts: any[]) => {
  const grouped: Record<string, any[]> = {};
  
  shifts.forEach(shift => {
    const date = new Date(shift.date);
    const week = getISOWeek(date);
    const year = getYear(date);
    const key = `KW ${week} ${year}`;
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(shift);
  });
  
  return grouped;
};

export const calculateShiftStatistics = (shifts: any[]) => {
  const totalShifts = shifts.length;
  
  // Durchschnittliche Schichtlänge
  const totalHours = shifts.reduce((sum, shift) => {
    const start = new Date(`${shift.date}T${shift.start_time}`);
    const end = new Date(`${shift.date}T${shift.end_time}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);
  const averageShiftLength = totalShifts > 0 ? totalHours / totalShifts : 0;
  
  // Wochenend-Schichten
  const weekendShifts = shifts.filter(shift => {
    const date = new Date(shift.date);
    const day = date.getDay();
    return day === 0 || day === 6;
  }).length;
  
  // Zuverlässigkeit
  const confirmedShifts = shifts.filter(s => s.status === 'confirmed').length;
  const reliabilityScore = totalShifts > 0 ? (confirmedShifts / totalShifts) * 100 : 0;
  
  const reliabilityLabel = 
    reliabilityScore >= 95 ? 'Sehr gut' :
    reliabilityScore >= 85 ? 'Gut' :
    reliabilityScore >= 70 ? 'Befriedigend' : 'Verbesserungswürdig';
  
  const currentMonth = new Date().toLocaleDateString('de-DE', { 
    month: 'short', 
    year: 'numeric' 
  });
  
  return {
    totalShifts,
    averageShiftLength,
    weekendShifts,
    maxWeekendShifts: 6,
    reliabilityScore,
    reliabilityLabel,
    currentMonth,
  };
};

export const getShiftTypeColor = (color: string) => {
  // Konvertiere Hex zu Tailwind-Klassen
  const colorMap: Record<string, string> = {
    '#3B82F6': 'bg-blue-500',
    '#10B981': 'bg-green-500',
    '#F59E0B': 'bg-amber-500',
    '#EF4444': 'bg-red-500',
  };
  
  return colorMap[color] || 'bg-gray-500';
};

export const formatTime = (time: string) => {
  return time.slice(0, 5); // HH:MM
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-DE', { 
    weekday: 'short', 
    day: '2-digit',
    month: '2-digit' 
  });
};
