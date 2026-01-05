import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';
import { calculateShiftStatistics, groupShiftsByWeek, getDateRange } from '@/utils/shift-planning';

export type TimeRange = 'next_14_days' | 'this_week' | 'this_month' | 'custom';

export const useEmployeeShifts = (employeeId: string, timeRange: TimeRange = 'next_14_days') => {
  const { startDate, endDate } = useMemo(() => getDateRange(timeRange), [timeRange]);

  const { data: shifts, isLoading: shiftsLoading } = useQuery({
    queryKey: ['employee-shifts', employeeId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          shift_type:shift_types(
            id,
            name,
            color,
            start_time,
            end_time
          )
        `)
        .eq('employee_id', employeeId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  const { data: shiftTypes } = useQuery({
    queryKey: ['shift-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });

  const groupedShifts = useMemo(() => {
    if (!shifts) return {};
    return groupShiftsByWeek(shifts);
  }, [shifts]);

  const statistics = useMemo(() => {
    if (!shifts || shifts.length === 0) {
      return {
        totalShifts: 0,
        averageShiftLength: 0,
        weekendShifts: 0,
        maxWeekendShifts: 0,
        reliabilityScore: 0,
        reliabilityLabel: '-',
        currentMonth: new Date().toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }),
      };
    }
    return calculateShiftStatistics(shifts);
  }, [shifts]);

  const shiftTypeDistribution = useMemo(() => {
    if (!shifts || !shiftTypes) return [];
    
    const distribution = shiftTypes.map(type => {
      const typeShifts = shifts.filter(s => s.shift_type?.id === type.id);
      const count = typeShifts.length;
      const percentage = shifts.length > 0 ? (count / shifts.length) * 100 : 0;
      
      return {
        shiftType: type,
        count,
        percentage,
      };
    }).filter(d => d.count > 0);

    return distribution;
  }, [shifts, shiftTypes]);

  return {
    shifts: shifts || [],
    shiftTypes: shiftTypes || [],
    groupedShifts,
    statistics,
    shiftTypeDistribution,
    isLoading: shiftsLoading,
  };
};
