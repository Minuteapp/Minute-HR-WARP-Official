
import { useState, useEffect } from 'react';
import { TimeEntry } from '@/types/time-tracking.types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import HistoryEmptyState from '@/components/time/HistoryEmptyState';

interface TimeEntriesTableProps {
  timeEntries: TimeEntry[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading?: boolean; // Optional mit Default-Wert false
}

export const TimeEntriesTable = ({ 
  timeEntries, 
  searchQuery, 
  onSearchChange,
  isLoading = false 
}: TimeEntriesTableProps) => {
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([]);
  
  useEffect(() => {
    // Filter entries based on searchQuery
    if (!searchQuery) {
      setFilteredEntries(timeEntries);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = timeEntries.filter(entry => 
      entry.project?.toLowerCase().includes(lowercaseQuery) ||
      entry.location?.toLowerCase().includes(lowercaseQuery) ||
      entry.note?.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredEntries(filtered);
  }, [timeEntries, searchQuery]);
  
  const getTimeDisplay = (entry: TimeEntry) => {
    try {
      const start = format(new Date(entry.start_time), 'HH:mm', { locale: de });
      
      if (!entry.end_time) {
        return `${start} - laufend`;
      }
      
      const end = format(new Date(entry.end_time), 'HH:mm', { locale: de });
      const startDate = format(new Date(entry.start_time), 'dd.MM.yyyy', { locale: de });
      
      return `${startDate}, ${start} - ${end}`;
    } catch {
      return 'Ungültiges Datum';
    }
  };
  
  const calculateDuration = (entry: TimeEntry) => {
    if (!entry.end_time) return 'Aktiv';
    
    try {
      const start = new Date(entry.start_time).getTime();
      const end = new Date(entry.end_time).getTime();
      const durationMs = end - start;
      
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      // Abzug der Pausenzeit
      let adjustedDurationHours = durationHours;
      let adjustedDurationMinutes = durationMinutes;
      
      if (entry.break_minutes) {
        const breakHours = Math.floor(entry.break_minutes / 60);
        const breakMinutes = entry.break_minutes % 60;
        
        adjustedDurationMinutes -= breakMinutes;
        if (adjustedDurationMinutes < 0) {
          adjustedDurationMinutes += 60;
          adjustedDurationHours -= 1;
        }
        
        adjustedDurationHours -= breakHours;
      }
      
      // Format: 2h 15m
      return `${adjustedDurationHours}h ${adjustedDurationMinutes}m`;
    } catch {
      return 'Ungültig';
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="w-full flex justify-between items-center">
          <h3 className="text-lg font-medium">Zeiteinträge</h3>
          <div className="relative w-64">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="bg-white border rounded-md">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b p-4 flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="w-full flex justify-between items-center">
        <h3 className="text-lg font-medium">Zeiteinträge</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nach Projekt oder Ort suchen"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="bg-white border rounded-md">
        {filteredEntries.length === 0 ? (
          searchQuery ? (
            <div className="p-8 text-center text-muted-foreground">
              Keine Zeiteinträge gefunden.
            </div>
          ) : (
            <HistoryEmptyState 
              onStartTracking={() => {
                window.location.href = '/time';
              }}
            />
          )
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="border-b last:border-0 p-4 flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <h4 className="font-medium">{entry.project || 'Kein Projekt'}</h4>
                <p className="text-sm text-muted-foreground">
                  {getTimeDisplay(entry)} • {entry.location || 'Kein Ort'}
                  {entry.note && ` • ${entry.note}`}
                </p>
              </div>
              <span className="font-medium">
                {calculateDuration(entry)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
