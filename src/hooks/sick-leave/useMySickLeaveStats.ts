import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface SickLeaveStats {
  totalDays: number;
  averageDays: number;
  lastDuration: string;
  lastRelativeTime: string;
}

export const useMySickLeaveStats = () => {
  const [stats, setStats] = useState<SickLeaveStats>({
    totalDays: 0,
    averageDays: 12,
    lastDuration: '-',
    lastRelativeTime: 'Keine Krankmeldungen',
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const currentYear = new Date().getFullYear();
        const yearStart = `${currentYear}-01-01`;
        const yearEnd = `${currentYear}-12-31`;

        // Fetch all sick leaves for current year that are approved or completed
        const { data, error } = await supabase
          .from('sick_leaves')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['approved', 'completed'])
          .gte('start_date', yearStart)
          .lte('start_date', yearEnd)
          .order('start_date', { ascending: false });

        if (error) {
          console.error('Error fetching stats:', error);
          return;
        }

        // Calculate total days for 2025
        let totalDays = 0;
        if (data && data.length > 0) {
          data.forEach((leave) => {
            const start = new Date(leave.start_date);
            const end = leave.end_date ? new Date(leave.end_date) : start;
            const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            totalDays += duration;
          });
        }

        // Get last completed sick leave
        const { data: lastLeave } = await supabase
          .from('sick_leaves')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('end_date', { ascending: false })
          .limit(1)
          .single();

        let lastDuration = '-';
        let lastRelativeTime = 'Keine Krankmeldungen';

        if (lastLeave) {
          const start = new Date(lastLeave.start_date);
          const end = lastLeave.end_date ? new Date(lastLeave.end_date) : start;
          const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          lastDuration = `${duration}`;
          lastRelativeTime = `vor ${formatDistanceToNow(end, { locale: de })}`;
        }

        setStats({
          totalDays,
          averageDays: 12, // This could be company average from settings
          lastDuration: lastDuration === '-' ? '-' : `${lastDuration} Tage`,
          lastRelativeTime,
        });
      } catch (err) {
        console.error('Error in useMySickLeaveStats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  return { stats, isLoading };
};
