import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTravelDashboardStats, useUpcomingTrips, useActiveTrips, useMyTravelRequests, useMyExpenses, useDepartmentOverview } from '@/hooks/useTravelDashboardStats';
import { AdminDashboardPreview, HRDashboardPreview, TeamLeaderDashboardPreview, EmployeeDashboardPreview } from './dashboard-previews';
import { Loader2 } from 'lucide-react';

function useUserRole() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return 'employee';
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error || !data) return 'employee';
      return data.role as string;
    },
    enabled: !!user?.id
  });
}

export function BusinessTravelDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useTravelDashboardStats();
  const { data: upcomingTrips = [] } = useUpcomingTrips();
  const { data: activeTrips = [] } = useActiveTrips();
  const { data: myRequests = [] } = useMyTravelRequests(user?.id);
  const { data: myExpenses = [] } = useMyExpenses(user?.id);
  const { data: departments = [] } = useDepartmentOverview();
  const { data: role = 'employee', isLoading: roleLoading } = useUserRole();

  if (statsLoading || roleLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render dashboard based on user role
  switch (role) {
    case 'superadmin':
    case 'admin':
      return (
        <AdminDashboardPreview
          stats={stats}
          upcomingTrips={upcomingTrips}
          activeTrips={activeTrips}
          departments={departments}
        />
      );
    case 'hr_admin':
      return (
        <HRDashboardPreview
          stats={stats}
          upcomingTrips={upcomingTrips}
          activeTrips={activeTrips}
          departments={departments}
        />
      );
    case 'team_lead':
      return (
        <TeamLeaderDashboardPreview
          stats={stats}
          upcomingTrips={upcomingTrips}
          activeTrips={activeTrips}
        />
      );
    case 'employee':
    default:
      return (
        <EmployeeDashboardPreview
          stats={stats}
          myRequests={myRequests}
          myExpenses={myExpenses}
        />
      );
  }
}
