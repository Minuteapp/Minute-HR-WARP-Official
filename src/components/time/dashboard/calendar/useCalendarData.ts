
import { useState, useEffect } from 'react';
import { TimeEntry } from '@/types/time-tracking.types';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth } from 'date-fns';

export const useCalendarData = (currentMonth: Date) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const startDate = startOfMonth(currentMonth);
        const endDate = endOfMonth(currentMonth);

        const { data: entries, error: entriesError } = await supabase
          .from('time_entries')
          .select('*')
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString())
          .order('start_time');

        if (entriesError) throw entriesError;
        setTimeEntries(entries || []);

        const { data: absenceData, error: absenceError } = await supabase
          .from('absences')
          .select('*')
          .gte('start_date', startDate.toISOString())
          .lte('end_date', endDate.toISOString());

        if (absenceError) throw absenceError;
        setAbsences(absenceData || []);
      } catch (error) {
        console.error('Fehler beim Laden der Kalenderdaten:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentMonth]);

  return { timeEntries, absences, isLoading };
};
