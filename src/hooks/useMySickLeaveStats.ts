import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { differenceInDays, parseISO, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface SickLeaveStats {
  totalDaysThisYear: number;
  lastSickLeaveDays: number | null;
  lastSickLeaveDate: string | null;
}

export const useMySickLeaveStats = () => {
  const [stats, setStats] = useState<SickLeaveStats>({
    totalDaysThisYear: 0,
    lastSickLeaveDays: null,
    lastSickLeaveDate: null,
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

        // Fetch all sick leaves for this year
        const { data: thisYearLeaves, error: yearError } = await supabase
          .from('sick_leaves')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['approved', 'completed'])
          .or(`start_date.gte.${yearStart},end_date.gte.${yearStart}`)
          .or(`start_date.lte.${yearEnd},end_date.lte.${yearEnd}`);

        if (yearError) throw yearError;

        // Calculate total days this year
        let totalDays = 0;
        thisYearLeaves?.forEach((leave) => {
          const startDate = parseISO(leave.start_date);
          const endDate = leave.end_date ? parseISO(leave.end_date) : startDate;
          const days = differenceInDays(endDate, startDate) + 1;
          totalDays += days;
        });

        // Fetch last completed sick leave
        const { data: lastLeave, error: lastError } = await supabase
          .from('sick_leaves')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('end_date', { ascending: false })
          .limit(1)
          .single();

        if (lastError && lastError.code !== 'PGRST116') {
          console.error('Error fetching last sick leave:', lastError);
        }

        let lastDays = null;
        let lastDate = null;

        if (lastLeave) {
          const startDate = parseISO(lastLeave.start_date);
          const endDate = lastLeave.end_date ? parseISO(lastLeave.end_date) : startDate;
          lastDays = differenceInDays(endDate, startDate) + 1;
          lastDate = formatDistanceToNow(endDate, { locale: de, addSuffix: true });
        }

        setStats({
          totalDaysThisYear: totalDays,
          lastSickLeaveDays: lastDays,
          lastSickLeaveDate: lastDate,
        });
      } catch (err) {
        console.error('Error in useMySickLeaveStats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  return { ...stats, isLoading };
};
