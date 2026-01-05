import { TimeEntry } from '@/types/time-tracking.types';

export interface BreakPeriod {
  id: string;
  from: string;
  to: string;
  type: string;
  duration: string;
}

export const formatTime = (dateStr?: string) => {
  if (!dateStr) return '--:--';
  return new Date(dateStr).toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

export const calculateWorkTime = (entry: TimeEntry) => {
  if (!entry.end_time) return '0:00';
  const start = new Date(entry.start_time).getTime();
  const end = new Date(entry.end_time).getTime();
  const duration = (end - start) / (1000 * 60); // in Minuten
  const workMinutes = duration - (entry.break_minutes || 0);
  const hours = Math.floor(workMinutes / 60);
  const minutes = Math.floor(workMinutes % 60);
  return `${hours}:${minutes.toString().padStart(2, '0')} Std`;
};

export const formatBreakTime = (breakMinutes?: number) => {
  if (!breakMinutes) return '0:00 Std';
  const hours = Math.floor(breakMinutes / 60);
  const minutes = breakMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')} Std`;
};

export const getStatusText = (status: TimeEntry['status']) => {
  switch(status) {
    case 'active': return 'Aktiv';
    case 'pending': return 'Pausiert';
    case 'completed': return 'Genehmigt';
    case 'cancelled': return 'Abgebrochen';
    default: return 'Unbekannt';
  }
};

export const getStatusColor = (status: TimeEntry['status']) => {
  switch(status) {
    case 'active': return 'bg-green-500';
    case 'pending': return 'bg-yellow-500';
    case 'completed': return 'bg-blue-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const getLocationText = (location?: string) => {
  switch(location) {
    case 'office': return 'Büro';
    case 'home': return 'Home Office';
    case 'client': return 'Beim Kunden';
    case 'mobile': return 'Unterwegs';
    default: return location || 'Nicht angegeben';
  }
};

export const parseBreaks = (entry: TimeEntry): BreakPeriod[] => {
  // Wenn break_minutes vorhanden ist, erstelle eine Standard-Mittagspause
  if (!entry.break_minutes) return [];
  
  // Berechne Pausenstart (30 Min nach Start + 3.5 Std Arbeit)
  const startTime = new Date(entry.start_time);
  const breakStart = new Date(startTime.getTime() + (3.5 * 60 * 60 * 1000));
  const breakEnd = new Date(breakStart.getTime() + (entry.break_minutes * 60 * 1000));
  
  const formatTimeOnly = (date: Date) => {
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };
  
  const hours = Math.floor(entry.break_minutes / 60);
  const minutes = entry.break_minutes % 60;
  const durationStr = `${hours}:${minutes.toString().padStart(2, '0')} Std`;
  
  return [
    {
      id: '1',
      from: formatTimeOnly(breakStart),
      to: formatTimeOnly(breakEnd),
      type: 'Mittagspause',
      duration: durationStr
    }
  ];
};
