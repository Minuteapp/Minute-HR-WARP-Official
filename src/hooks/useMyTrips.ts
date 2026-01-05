import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExtendedBusinessTrip, MyTripsStats } from "@/types/business-travel-extended";
import { useState, useMemo } from "react";

export const useMyTrips = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch all trips
  const { data: trips, isLoading, refetch } = useQuery({
    queryKey: ["my-trips"],
    queryFn: async (): Promise<ExtendedBusinessTrip[]> => {
      const { data, error } = await supabase
        .from("business_trips")
        .select(`
          *,
          trip_projects:trip_projects(id, project_name),
          trip_tasks:trip_tasks(id, title, is_completed)
        `)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return (data || []) as ExtendedBusinessTrip[];
    },
  });

  // Calculate stats
  const stats: MyTripsStats = useMemo(() => {
    if (!trips) return { totalTrips: 0, totalBudget: 0, totalExpenses: 0, totalCO2: 0 };

    return {
      totalTrips: trips.length,
      totalBudget: trips.reduce((sum, t) => sum + (t.budget || 0), 0),
      totalExpenses: trips.reduce((sum, t) => sum + (t.total_cost || 0), 0),
      totalCO2: trips.reduce((sum, t) => sum + (t.co2_emission || 0), 0),
    };
  }, [trips]);

  // Filter counts
  const filterCounts = useMemo(() => {
    if (!trips) return { all: 0, planned: 0, completed: 0, pending: 0 };

    return {
      all: trips.length,
      planned: trips.filter(t => t.status === "geplant" || t.status === "planned" || t.status === "confirmed").length,
      completed: trips.filter(t => t.status === "abgeschlossen" || t.status === "completed").length,
      pending: trips.filter(t => t.status === "ausstehend" || t.status === "pending").length,
    };
  }, [trips]);

  // Filtered trips
  const filteredTrips = useMemo(() => {
    if (!trips) return [];

    let result = [...trips];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(trip => {
        switch (statusFilter) {
          case "planned":
            return trip.status === "geplant" || trip.status === "planned" || trip.status === "confirmed";
          case "completed":
            return trip.status === "abgeschlossen" || trip.status === "completed";
          case "pending":
            return trip.status === "ausstehend" || trip.status === "pending";
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trip =>
        trip.title?.toLowerCase().includes(query) ||
        trip.destination?.toLowerCase().includes(query) ||
        trip.city?.toLowerCase().includes(query) ||
        trip.country?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [trips, statusFilter, searchQuery]);

  return {
    trips: filteredTrips,
    allTrips: trips || [],
    stats,
    filterCounts,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    refetch,
  };
};
