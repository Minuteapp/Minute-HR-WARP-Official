
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';

export const useSickLeaveStatistics = (startDate: Date, endDate: Date, department: string = 'all') => {
  const [statistics, setStatistics] = useState<any>(null);
  const [distributionByReason, setDistributionByReason] = useState<any[]>([]);
  const [averageDurationByDepartment, setAverageDurationByDepartment] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);

      try {
        // Fetch all sick leaves for the period
        let query = supabase
          .from('sick_leaves')
          .select(`
            *,
            profiles:user_id (
              department
            )
          `)
          .gte('start_date', startDate.toISOString())
          .lte('end_date', endDate.toISOString());

        if (department !== 'all') {
          query = query.eq('profiles.department', department);
        }

        const { data: sickLeavesData, error: sickLeavesError } = await query;

        if (sickLeavesError) {
          throw new Error(`Fehler beim Laden der Krankmeldungen: ${sickLeavesError.message}`);
        }

        // Fetch unique departments
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('department')
          .not('department', 'is', null);

        if (profilesError) {
          throw new Error(`Fehler beim Laden der Abteilungen: ${profilesError.message}`);
        }

        // Extract unique departments
        const uniqueDepartments = Array.from(new Set(profilesData.map((profile: any) => profile.department).filter(Boolean)));
        setDepartments(uniqueDepartments);

        // Process data for statistics
        const sickLeaves = sickLeavesData || [];
        
        // Calculate total sick days
        let totalSickDays = 0;
        sickLeaves.forEach((sl: any) => {
          const start = new Date(sl.start_date);
          const end = new Date(sl.end_date || sl.start_date);
          const days = differenceInDays(end, start) + 1; // Include both start and end day
          totalSickDays += days;
        });

        // Calculate average duration
        const averageDuration = sickLeaves.length > 0 ? totalSickDays / sickLeaves.length : 0;

        // Calculate employee count for average per employee
        const { count: employeeCount, error: countError } = department === 'all'
          ? await supabase.from('profiles').select('*', { count: 'exact', head: true })
          : await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('department', department);

        if (countError) {
          throw new Error(`Fehler beim Zählen der Mitarbeiter: ${countError.message}`);
        }

        const averagePerEmployee = employeeCount > 0 ? totalSickDays / employeeCount : 0;

        // Generate timeline data (monthly)
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        const timelineData = months.map(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          
          let sickDaysInMonth = 0;
          sickLeaves.forEach((sl: any) => {
            const slStart = new Date(sl.start_date);
            const slEnd = new Date(sl.end_date || sl.start_date);
            
            // Calculate overlap between sick leave and month
            const overlapStart = slStart > monthStart ? slStart : monthStart;
            const overlapEnd = slEnd < monthEnd ? slEnd : monthEnd;
            
            if (overlapStart <= overlapEnd) {
              sickDaysInMonth += differenceInDays(overlapEnd, overlapStart) + 1;
            }
          });
          
          return {
            name: format(month, 'MMM yyyy', { locale: de }),
            value: sickDaysInMonth
          };
        });

        // Generate distribution by reason
        const reasonsMap = new Map();
        sickLeaves.forEach((sl: any) => {
          const start = new Date(sl.start_date);
          const end = new Date(sl.end_date || sl.start_date);
          const days = differenceInDays(end, start) + 1;
          
          if (reasonsMap.has(sl.reason)) {
            reasonsMap.set(sl.reason, reasonsMap.get(sl.reason) + days);
          } else {
            reasonsMap.set(sl.reason, days);
          }
        });
        
        const reasonsDistribution = Array.from(reasonsMap.entries()).map(([name, value]) => ({
          name,
          value
        }));
        
        // Calculate average duration by department
        const departmentDurationsMap = new Map();
        const departmentCountMap = new Map();
        
        sickLeaves.forEach((sl: any) => {
          const dept = sl.profiles?.department || 'Keine Abteilung';
          const start = new Date(sl.start_date);
          const end = new Date(sl.end_date || sl.start_date);
          const days = differenceInDays(end, start) + 1;
          
          if (departmentDurationsMap.has(dept)) {
            departmentDurationsMap.set(dept, departmentDurationsMap.get(dept) + days);
            departmentCountMap.set(dept, departmentCountMap.get(dept) + 1);
          } else {
            departmentDurationsMap.set(dept, days);
            departmentCountMap.set(dept, 1);
          }
        });
        
        const deptDurations = Array.from(departmentDurationsMap.entries()).map(([name, totalDays]) => ({
          name,
          value: totalDays / (departmentCountMap.get(name) || 1)
        }));
        
        // Sort by value descending
        deptDurations.sort((a, b) => b.value - a.value);

        // Set the statistics state
        setStatistics({
          totalSickDays,
          totalEntries: sickLeaves.length,
          averageDuration,
          averagePerEmployee,
          timelineData
        });
        
        setDistributionByReason(reasonsDistribution);
        setAverageDurationByDepartment(deptDurations);
      } catch (error: any) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [startDate, endDate, department]);

  return {
    statistics,
    departments,
    isLoading,
    distributionByReason,
    averageDurationByDepartment
  };
};
