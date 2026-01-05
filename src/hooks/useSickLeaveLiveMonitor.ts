
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, addDays, isAfter, isBefore, differenceInDays } from 'date-fns';

export const useSickLeaveLiveMonitor = () => {
  const [absentToday, setAbsentToday] = useState<any[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch current date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Fetch sick leaves that overlap with today
        const { data: sickLeavesData, error: sickLeavesError } = await supabase
          .from('sick_leaves')
          .select(`
            *,
            employees!sick_leaves_user_id_fkey (
              name,
              department
            )
          `)
          .lte('start_date', today.toISOString())
          .gte('end_date', today.toISOString());
        
        if (sickLeavesError) {
          throw new Error(`Fehler beim Laden der Krankmeldungen: ${sickLeavesError.message}`);
        }
        
        // Fetch unique departments
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('department')
          .not('department', 'is', null);
        
        if (employeesError) {
          throw new Error(`Fehler beim Laden der Abteilungen: ${employeesError.message}`);
        }
        
        // Format the absent employees data
        const formattedAbsentToday = sickLeavesData?.map((sl) => {
          const endDate = new Date(sl.end_date);
          const isLastDay = endDate.toDateString() === today.toDateString();
          
          return {
            id: sl.id,
            name: sl.employees?.name || 'Unbekannt',
            department: sl.employees?.department || 'Keine Abteilung',
            startDate: sl.start_date,
            endDate: sl.end_date,
            isPartialDay: sl.is_partial_day,
            startTime: sl.start_time,
            endTime: sl.end_time,
            reason: sl.reason,
            hasDocuments: sl.has_documents,
            isChildSickLeave: sl.is_child_sick_leave,
            isLastDay
          };
        }) || [];
        
        // Fetch sick leaves that will expire soon (in the next 3 days)
        const threeDaysFromNow = addDays(today, 3);
        
        const { data: expiringSoonData, error: expiringSoonError } = await supabase
          .from('sick_leaves')
          .select(`
            *,
            employees!sick_leaves_user_id_fkey (
              name,
              department
            )
          `)
          .gt('end_date', today.toISOString())
          .lte('end_date', threeDaysFromNow.toISOString());
        
        if (expiringSoonError) {
          throw new Error(`Fehler beim Laden der bald ablaufenden Krankmeldungen: ${expiringSoonError.message}`);
        }
        
        // Format the expiring soon data
        const formattedExpiringSoon = expiringSoonData?.map((sl) => {
          const endDate = new Date(sl.end_date);
          const daysRemaining = differenceInDays(endDate, today);
          
          return {
            id: sl.id,
            name: sl.employees?.name || 'Unbekannt',
            department: sl.employees?.department || 'Keine Abteilung',
            endDate: sl.end_date,
            daysRemaining,
            reason: sl.reason,
            hasDocuments: sl.has_documents
          };
        }) || [];
        
        // Extract unique departments
        const uniqueDepartments = Array.from(new Set(employeesData.map(emp => emp.department).filter(Boolean)));
        
        setAbsentToday(formattedAbsentToday);
        setExpiringSoon(formattedExpiringSoon);
        setDepartments(uniqueDepartments);
      } catch (error: any) {
        console.error('Error fetching live monitor data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    absentToday,
    expiringSoon,
    departments,
    isLoading
  };
};
