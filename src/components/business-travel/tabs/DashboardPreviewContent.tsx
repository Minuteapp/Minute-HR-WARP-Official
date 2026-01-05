import React from 'react';
import { useTravelDashboardStats, useUpcomingTrips, useActiveTrips, useMyTravelRequests, useMyExpenses, useDepartmentOverview } from '@/hooks/useTravelDashboardStats';
import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboardPreview, HRDashboardPreview, TeamLeaderDashboardPreview, EmployeeDashboardPreview } from '../dashboard-previews';

interface DashboardPreviewContentProps {
  selectedRole: string;
}

export function DashboardPreviewContent({ selectedRole }: DashboardPreviewContentProps) {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useTravelDashboardStats();
  const { data: upcomingTrips = [] } = useUpcomingTrips();
  const { data: activeTrips = [] } = useActiveTrips();
  const { data: myRequests = [] } = useMyTravelRequests(user?.id);
  const { data: myExpenses = [] } = useMyExpenses(user?.id);
  const { data: departments = [] } = useDepartmentOverview();

  if (statsLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  switch (selectedRole) {
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