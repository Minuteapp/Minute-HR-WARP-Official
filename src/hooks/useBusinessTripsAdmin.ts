import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminDashboardStats, DepartmentOverview, SystemActivityLog, ExtendedBusinessTrip } from "@/types/business-travel-extended";

export const useBusinessTripsAdmin = () => {
  // Fetch admin dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async (): Promise<AdminDashboardStats> => {
      // Get total budget from all trips
      const { data: trips } = await supabase
        .from("business_trips")
        .select("budget, status, created_at");

      const totalBudget = trips?.reduce((sum, trip) => sum + (trip.budget || 0), 0) || 0;

      // Get active employees (unique employee_ids from trips)
      const { data: employees } = await supabase
        .from("business_trips")
        .select("employee_id")
        .not("employee_id", "is", null);

      const uniqueEmployees = new Set(employees?.map(e => e.employee_id) || []);

      // Get departments count from employees table
      const { data: departments } = await supabase
        .from("employees")
        .select("department")
        .not("department", "is", null);

      const uniqueDepartments = new Set(departments?.map(d => d.department) || []);

      // Get new requests (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const newRequests = trips?.filter(t => 
        new Date(t.created_at) >= sevenDaysAgo
      ).length || 0;

      // Get pending requests
      const pendingRequests = trips?.filter(t => 
        t.status === "pending" || t.status === "ausstehend"
      ).length || 0;

      return {
        totalBudget,
        activeEmployees: uniqueEmployees.size,
        departmentsCount: uniqueDepartments.size || 1,
        newRequestsCount: newRequests,
        pendingRequestsCount: pendingRequests,
      };
    },
  });

  // Fetch upcoming trips (next 7 days)
  const { data: upcomingTrips, isLoading: upcomingLoading } = useQuery({
    queryKey: ["upcoming-trips"],
    queryFn: async (): Promise<ExtendedBusinessTrip[]> => {
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("business_trips")
        .select("*")
        .gte("start_date", today)
        .lte("start_date", nextWeekStr)
        .order("start_date", { ascending: true })
        .limit(10);

      if (error) throw error;
      return (data || []) as ExtendedBusinessTrip[];
    },
  });

  // Fetch currently active trips
  const { data: activeTrips, isLoading: activeLoading } = useQuery({
    queryKey: ["active-trips"],
    queryFn: async (): Promise<ExtendedBusinessTrip[]> => {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("business_trips")
        .select("*")
        .lte("start_date", today)
        .gte("end_date", today)
        .order("start_date", { ascending: true })
        .limit(10);

      if (error) throw error;
      return (data || []) as ExtendedBusinessTrip[];
    },
  });

  // Fetch department overview
  const { data: departmentOverview, isLoading: departmentsLoading } = useQuery({
    queryKey: ["department-overview"],
    queryFn: async (): Promise<DepartmentOverview[]> => {
      const { data: employees } = await supabase
        .from("employees")
        .select("id, department");

      const { data: trips } = await supabase
        .from("business_trips")
        .select("employee_id, budget, total_cost, status");

      const departmentMap = new Map<string, DepartmentOverview>();

      employees?.forEach(emp => {
        const dept = emp.department || "Unbekannt";
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, {
            department: dept,
            employeeCount: 0,
            activeTrips: 0,
            budget: 0,
            spent: 0,
          });
        }
        const deptData = departmentMap.get(dept)!;
        deptData.employeeCount++;

        // Find trips for this employee
        const empTrips = trips?.filter(t => t.employee_id === emp.id) || [];
        empTrips.forEach(trip => {
          deptData.budget += trip.budget || 0;
          deptData.spent += trip.total_cost || 0;
          if (trip.status === "active" || trip.status === "in_progress") {
            deptData.activeTrips++;
          }
        });
      });

      return Array.from(departmentMap.values());
    },
  });

  // Fetch system activity log
  const { data: activityLog, isLoading: activityLoading } = useQuery({
    queryKey: ["system-activity-log"],
    queryFn: async (): Promise<SystemActivityLog[]> => {
      const { data, error } = await supabase
        .from("system_activity_log")
        .select("*")
        .eq("module", "business_travel")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data || []) as SystemActivityLog[];
    },
  });

  return {
    stats: stats || {
      totalBudget: 0,
      activeEmployees: 0,
      departmentsCount: 0,
      newRequestsCount: 0,
      pendingRequestsCount: 0,
    },
    upcomingTrips: upcomingTrips || [],
    activeTrips: activeTrips || [],
    departmentOverview: departmentOverview || [],
    activityLog: activityLog || [],
    isLoading: statsLoading || upcomingLoading || activeLoading || departmentsLoading || activityLoading,
  };
};
