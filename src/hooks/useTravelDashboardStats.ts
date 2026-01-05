import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  totalBudget: number;
  usedBudget: number;
  newRequestsThisWeek: number;
  pendingApprovals: number;
  approvedThisMonth: number;
  totalExpenses: number;
  myBudget: number;
  myUsedBudget: number;
  myOpenRequests: number;
  myTripsThisYear: number;
  myPendingReceipts: number;
  teamMembers: number;
  teamBudget: number;
  teamUsedBudget: number;
  teamPendingApprovals: number;
  teamApprovedThisMonth: number;
  activeTrips: number;
  upcomingTrips: number;
}

export function useTravelDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['travel-dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      // Parallel queries for better performance
      const [
        employeesResult,
        departmentsResult,
        businessTripsResult,
        approvalsResult,
        expensesResult
      ] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact' }),
        supabase.from('departments').select('id, budget', { count: 'exact' }),
        supabase.from('business_trips').select('*'),
        supabase.from('travel_approvals').select('*'),
        supabase.from('business_trip_expenses').select('*')
      ]);

      const employees = employeesResult.data || [];
      const departments = departmentsResult.data || [];
      const businessTrips = businessTripsResult.data || [];
      const approvals = approvalsResult.data || [];
      const expenses = expensesResult.data || [];

      // Calculate stats
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Total budget from departments
      const totalBudget = departments.reduce((sum, dept) => sum + (Number(dept.budget) || 0), 0);

      // Total expenses
      const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

      // New requests this week
      const newRequestsThisWeek = businessTrips.filter(trip => {
        const created = new Date(trip.created_at);
        return created >= startOfWeek;
      }).length;

      // Pending approvals
      const pendingApprovals = approvals.filter(a => a.status === 'pending').length;

      // Approved this month
      const approvedThisMonth = approvals.filter(a => {
        if (a.status !== 'approved') return false;
        const approved = new Date(a.approved_at || a.updated_at);
        return approved >= startOfMonth;
      }).length;

      // Active trips (currently happening)
      const activeTrips = businessTrips.filter(trip => {
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        return start <= now && end >= now;
      }).length;

      // Upcoming trips (next 7 days)
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      const upcomingTrips = businessTrips.filter(trip => {
        const start = new Date(trip.start_date);
        return start > now && start <= nextWeek;
      }).length;

      // User-specific stats
      const myTrips = businessTrips.filter(t => t.employee_id === user?.id || t.user_id === user?.id);
      const myExpenses = expenses.filter(e => {
        const trip = businessTrips.find(t => t.id === e.trip_id);
        return trip && (trip.employee_id === user?.id || trip.user_id === user?.id);
      });

      const myUsedBudget = myExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
      const myOpenRequests = approvals.filter(a => 
        a.status === 'pending' && businessTrips.some(t => 
          t.id === a.trip_id && (t.employee_id === user?.id || t.user_id === user?.id)
        )
      ).length;
      const myTripsThisYear = myTrips.filter(t => {
        const start = new Date(t.start_date);
        return start >= startOfYear;
      }).length;
      const myPendingReceipts = myExpenses.filter(e => !e.receipt_url).length;

      // Team stats (simplified - in real app would be based on team membership)
      const teamMembers = Math.min(12, employees.length);
      const teamBudget = Math.round(totalBudget * 0.15); // ~15% of total
      const teamUsedBudget = Math.round(totalExpenses * 0.15);
      const teamPendingApprovals = Math.min(8, pendingApprovals);
      const teamApprovedThisMonth = Math.round(approvedThisMonth * 0.15);

      return {
        totalEmployees: employeesResult.count || employees.length,
        totalDepartments: departmentsResult.count || departments.length,
        totalBudget,
        usedBudget: totalExpenses,
        newRequestsThisWeek,
        pendingApprovals,
        approvedThisMonth,
        totalExpenses,
        myBudget: 12000,
        myUsedBudget,
        myOpenRequests,
        myTripsThisYear,
        myPendingReceipts,
        teamMembers,
        teamBudget,
        teamUsedBudget,
        teamPendingApprovals,
        teamApprovedThisMonth,
        activeTrips,
        upcomingTrips
      };
    },
    staleTime: 30000 // 30 seconds
  });
}

// Hook for upcoming trips data
export function useUpcomingTrips(limit = 5) {
  return useQuery({
    queryKey: ['upcoming-trips', limit],
    queryFn: async () => {
      const now = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { data, error } = await supabase
        .from('business_trips')
        .select(`
          *,
          employees:employee_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .gte('start_date', now)
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    }
  });
}

// Hook for active trips (currently traveling)
export function useActiveTrips(limit = 5) {
  return useQuery({
    queryKey: ['active-trips', limit],
    queryFn: async () => {
      const now = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('business_trips')
        .select(`
          *,
          employees:employee_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('end_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    }
  });
}

// Hook for user's own requests
export function useMyTravelRequests(userId?: string, limit = 5) {
  return useQuery({
    queryKey: ['my-travel-requests', userId, limit],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('business_trips')
        .select(`
          *,
          travel_approvals (status, approved_at)
        `)
        .or(`employee_id.eq.${userId},user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });
}

// Hook for user's expenses
export function useMyExpenses(userId?: string, limit = 5) {
  return useQuery({
    queryKey: ['my-expenses', userId, limit],
    queryFn: async () => {
      if (!userId) return [];

      const { data: trips } = await supabase
        .from('business_trips')
        .select('id')
        .or(`employee_id.eq.${userId},user_id.eq.${userId}`);

      const tripIds = (trips || []).map(t => t.id);
      if (tripIds.length === 0) return [];

      const { data, error } = await supabase
        .from('business_trip_expenses')
        .select('*')
        .in('trip_id', tripIds)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });
}

// Hook for department overview
export function useDepartmentOverview() {
  return useQuery({
    queryKey: ['department-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          id,
          name,
          budget,
          employees:employees(count)
        `)
        .limit(8);

      if (error) throw error;
      return data || [];
    }
  });
}
