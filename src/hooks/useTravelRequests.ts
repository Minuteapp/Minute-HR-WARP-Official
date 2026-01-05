import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";

export interface TravelRequestWithEmployee {
  id: string;
  title: string;
  description: string | null;
  destination: string | null;
  country: string | null;
  city: string | null;
  destination_image_url: string | null;
  start_date: string;
  end_date: string;
  duration_days: number | null;
  status: string;
  budget: number | null;
  total_cost: number | null;
  co2_emission: number | null;
  booking_reference: string | null;
  priority: string | null;
  approval_status: string | null;
  approved_by: string | null;
  trip_number: string | null;
  timezone: string | null;
  employee_id: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
  // Employee info
  employee_name?: string;
  employee_email?: string;
  employee_avatar?: string | null;
  employee_department?: string;
  employee_position?: string;
}

export interface TravelRequestsStats {
  newRequests: number;
  allTrips: number;
  approved: number;
  rejected: number;
  archived: number;
}

export const useTravelRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeframeFilter, setTimeframeFilter] = useState<string>("all");
  const [kpiFilter, setKpiFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch all trips with employee info
  const { data: trips, isLoading } = useQuery({
    queryKey: ["travel-requests-admin"],
    queryFn: async (): Promise<TravelRequestWithEmployee[]> => {
      const { data: tripsData, error } = await supabase
        .from("business_trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch employee info for each trip
      const tripsWithEmployee = await Promise.all(
        (tripsData || []).map(async (trip) => {
          let employeeInfo = {
            employee_name: "Unbekannt",
            employee_email: "",
            employee_avatar: null as string | null,
            employee_department: "Unbekannt",
            employee_position: "",
          };

          if (trip.employee_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("first_name, last_name, email, avatar_url, department, position")
              .eq("id", trip.employee_id)
              .single();

            if (profile) {
              employeeInfo = {
                employee_name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.email || "Unbekannt",
                employee_email: profile.email || "",
                employee_avatar: profile.avatar_url,
                employee_department: profile.department || "Unbekannt",
                employee_position: profile.position || "",
              };
            }
          }

          return {
            ...trip,
            ...employeeInfo,
          } as TravelRequestWithEmployee;
        })
      );

      return tripsWithEmployee;
    },
  });

  // Fetch departments for filter
  const { data: departments } = useQuery({
    queryKey: ["departments-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("name")
        .order("name");

      if (error) return [];
      return data?.map((d) => d.name) || [];
    },
  });

  // Calculate stats
  const stats = useMemo((): TravelRequestsStats => {
    if (!trips) {
      return { newRequests: 0, allTrips: 0, approved: 0, rejected: 0, archived: 0 };
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      newRequests: trips.filter((t) => new Date(t.created_at) >= sevenDaysAgo).length,
      allTrips: trips.length,
      approved: trips.filter((t) => t.status?.toLowerCase() === "approved" || t.status?.toLowerCase() === "genehmigt").length,
      rejected: trips.filter((t) => t.status?.toLowerCase() === "rejected" || t.status?.toLowerCase() === "abgelehnt").length,
      archived: trips.filter((t) => t.status?.toLowerCase() === "archived" || t.status?.toLowerCase() === "archiviert").length,
    };
  }, [trips]);

  // Filter trips
  const filteredTrips = useMemo(() => {
    if (!trips) return [];

    let result = [...trips];

    // KPI filter
    if (kpiFilter !== "all") {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      switch (kpiFilter) {
        case "new":
          result = result.filter((t) => new Date(t.created_at) >= sevenDaysAgo);
          break;
        case "approved":
          result = result.filter((t) => t.status?.toLowerCase() === "approved" || t.status?.toLowerCase() === "genehmigt");
          break;
        case "rejected":
          result = result.filter((t) => t.status?.toLowerCase() === "rejected" || t.status?.toLowerCase() === "abgelehnt");
          break;
        case "archived":
          result = result.filter((t) => t.status?.toLowerCase() === "archived" || t.status?.toLowerCase() === "archiviert");
          break;
      }
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(term) ||
          t.destination?.toLowerCase().includes(term) ||
          t.city?.toLowerCase().includes(term) ||
          t.country?.toLowerCase().includes(term) ||
          t.employee_name?.toLowerCase().includes(term) ||
          t.employee_department?.toLowerCase().includes(term)
      );
    }

    // Department filter
    if (departmentFilter !== "all") {
      result = result.filter((t) => t.employee_department === departmentFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Timeframe filter
    if (timeframeFilter !== "all") {
      const now = new Date();
      switch (timeframeFilter) {
        case "week":
          result = result.filter((t) => {
            const start = new Date(t.start_date);
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return start >= now && start <= weekFromNow;
          });
          break;
        case "month":
          result = result.filter((t) => {
            const start = new Date(t.start_date);
            const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            return start >= now && start <= monthFromNow;
          });
          break;
        case "quarter":
          result = result.filter((t) => {
            const start = new Date(t.start_date);
            const quarterFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
            return start >= now && start <= quarterFromNow;
          });
          break;
        case "past":
          result = result.filter((t) => new Date(t.end_date) < now);
          break;
      }
    }

    return result;
  }, [trips, searchTerm, departmentFilter, statusFilter, timeframeFilter, kpiFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    trips: paginatedTrips,
    allTrips: filteredTrips,
    stats,
    departments: departments || [],
    isLoading,
    // Filters
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    timeframeFilter,
    setTimeframeFilter,
    kpiFilter,
    setKpiFilter,
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems: filteredTrips.length,
    itemsPerPage,
  };
};
