import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExtendedBusinessTrip, TripHotel, TripMeetingLocation, TripAgendaItem, TripProject, TripTask, TripCost, TripDocument } from "@/types/business-travel-extended";
import { toast } from "sonner";

export const useTripDetails = (tripId: string | null) => {
  const queryClient = useQueryClient();

  // Fetch trip with all relations
  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip-details", tripId],
    queryFn: async (): Promise<ExtendedBusinessTrip | null> => {
      if (!tripId) return null;

      const { data, error } = await supabase
        .from("business_trips")
        .select("*")
        .eq("id", tripId)
        .single();

      if (error) throw error;
      return data as ExtendedBusinessTrip;
    },
    enabled: !!tripId,
  });

  // Fetch hotels
  const { data: hotels } = useQuery({
    queryKey: ["trip-hotels", tripId],
    queryFn: async (): Promise<TripHotel[]> => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from("trip_hotels")
        .select("*")
        .eq("business_trip_id", tripId);

      if (error) throw error;
      return (data || []) as TripHotel[];
    },
    enabled: !!tripId,
  });

  // Fetch meeting locations
  const { data: meetingLocations } = useQuery({
    queryKey: ["trip-meeting-locations", tripId],
    queryFn: async (): Promise<TripMeetingLocation[]> => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from("trip_meeting_locations")
        .select("*")
        .eq("business_trip_id", tripId);

      if (error) throw error;
      return (data || []) as TripMeetingLocation[];
    },
    enabled: !!tripId,
  });

  // Fetch agenda items
  const { data: agendaItems } = useQuery({
    queryKey: ["trip-agenda-items", tripId],
    queryFn: async (): Promise<TripAgendaItem[]> => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from("trip_agenda_items")
        .select("*")
        .eq("business_trip_id", tripId)
        .order("agenda_date", { ascending: true });

      if (error) throw error;
      return (data || []) as TripAgendaItem[];
    },
    enabled: !!tripId,
  });

  // Fetch projects
  const { data: projects } = useQuery({
    queryKey: ["trip-projects", tripId],
    queryFn: async (): Promise<TripProject[]> => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from("trip_projects")
        .select("*")
        .eq("business_trip_id", tripId);

      if (error) throw error;
      return (data || []) as TripProject[];
    },
    enabled: !!tripId,
  });

  // Fetch tasks
  const { data: tasks } = useQuery({
    queryKey: ["trip-tasks", tripId],
    queryFn: async (): Promise<TripTask[]> => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from("trip_tasks")
        .select("*")
        .eq("business_trip_id", tripId);

      if (error) throw error;
      return (data || []) as TripTask[];
    },
    enabled: !!tripId,
  });

  // Fetch flight details
  const { data: flightDetails } = useQuery({
    queryKey: ["trip-flights", tripId],
    queryFn: async () => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from("flight_details")
        .select("*")
        .eq("business_trip_id", tripId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!tripId,
  });

  // Fetch costs
  const { data: costs } = useQuery({
    queryKey: ["trip-costs", tripId],
    queryFn: async (): Promise<TripCost[]> => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from("trip_costs")
        .select("*")
        .eq("business_trip_id", tripId);

      if (error) throw error;
      return (data || []) as TripCost[];
    },
    enabled: !!tripId,
  });

  // Fetch documents
  const { data: documents } = useQuery({
    queryKey: ["trip-documents", tripId],
    queryFn: async (): Promise<TripDocument[]> => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from("trip_documents")
        .select("*")
        .eq("business_trip_id", tripId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as TripDocument[];
    },
    enabled: !!tripId,
  });

  // Add project mutation
  const addProjectMutation = useMutation({
    mutationFn: async (projectName: string) => {
      if (!tripId) throw new Error("No trip ID");

      const { data, error } = await supabase
        .from("trip_projects")
        .insert({ business_trip_id: tripId, project_name: projectName })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-projects", tripId] });
      toast.success("Projekt hinzugefügt");
    },
    onError: () => {
      toast.error("Fehler beim Hinzufügen des Projekts");
    },
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!tripId) throw new Error("No trip ID");

      const { data, error } = await supabase
        .from("trip_tasks")
        .insert({ business_trip_id: tripId, title })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-tasks", tripId] });
      toast.success("Aufgabe hinzugefügt");
    },
    onError: () => {
      toast.error("Fehler beim Hinzufügen der Aufgabe");
    },
  });

  // Toggle task completion
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) => {
      const { error } = await supabase
        .from("trip_tasks")
        .update({ is_completed: isCompleted })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-tasks", tripId] });
    },
  });

  return {
    trip,
    hotels: hotels || [],
    meetingLocations: meetingLocations || [],
    agendaItems: agendaItems || [],
    projects: projects || [],
    tasks: tasks || [],
    flightDetails: flightDetails || [],
    costs: costs || [],
    documents: documents || [],
    isLoading,
    addProject: addProjectMutation.mutate,
    addTask: addTaskMutation.mutate,
    toggleTask: toggleTaskMutation.mutate,
  };
};
