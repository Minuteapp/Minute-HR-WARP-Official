import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

// Helper to get the correct user_id from employees table
const getEmployeeUserId = async (employeeId: string) => {
  const { data: employee } = await supabase
    .from('employees')
    .select('id, user_id, email')
    .eq('id', employeeId)
    .maybeSingle();
  
  // Return user_id if available, otherwise try to match by email
  if (employee?.user_id) {
    return employee.user_id;
  }
  
  // Fallback: try to find profile by email
  if (employee?.email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', employee.email)
      .maybeSingle();
    
    if (profile?.id) {
      return profile.id;
    }
  }
  
  // Last resort: return employeeId itself (might work if employees.id === auth.user.id)
  return employeeId;
};

export const useEmployeeWeekTime = (employeeId: string | undefined) => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  return useQuery({
    queryKey: ['employee-week-time', employeeId, weekStart, weekEnd],
    queryFn: async () => {
      if (!employeeId) throw new Error('Employee ID required');
      
      const userId = await getEmployeeUserId(employeeId);
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });
};

export const useEmployeeOvertime = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ['employee-overtime', employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error('Employee ID required');
      
      const { data, error } = await supabase
        .from('overtime_entries')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });
};

export const useEmployeeProjectTime = (employeeId: string | undefined) => {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  return useQuery({
    queryKey: ['employee-project-time', employeeId, monthStart, monthEnd],
    queryFn: async () => {
      if (!employeeId) throw new Error('Employee ID required');
      
      const userId = await getEmployeeUserId(employeeId);
      
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          projects (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString())
        .not('project', 'is', null);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });
};

export const useEmployeeCheckInHistory = (employeeId: string | undefined) => {
  const last7Days = subDays(new Date(), 7);

  return useQuery({
    queryKey: ['employee-checkin-history', employeeId, last7Days],
    queryFn: async () => {
      if (!employeeId) throw new Error('Employee ID required');
      
      const userId = await getEmployeeUserId(employeeId);
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', last7Days.toISOString())
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });
};
