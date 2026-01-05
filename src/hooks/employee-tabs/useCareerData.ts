import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";

export const useCareerData = (employeeId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  // Talentpool Status
  const { data: talentPoolStatus, isLoading: isLoadingTalent } = useQuery({
    queryKey: ["talent-pool-status", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("talent_pool_status")
        .select("*")
        .eq("employee_id", employeeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Karrierepfad
  const { data: careerPath, isLoading: isLoadingPath } = useQuery({
    queryKey: ["career-path", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("career_path")
        .select("*")
        .eq("employee_id", employeeId)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Entwicklungsziele
  const { data: careerGoals, isLoading: isLoadingGoals } = useQuery({
    queryKey: ["career-goals", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("career_goals")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Kompetenzlücken
  const { data: competencyGaps, isLoading: isLoadingGaps } = useQuery({
    queryKey: ["competency-gaps", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("competency_gaps")
        .select("*")
        .eq("employee_id", employeeId);
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Nachfolgeplanung
  const { data: successionPlanning, isLoading: isLoadingSuccession } = useQuery({
    queryKey: ["succession-planning", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("succession_planning")
        .select("*, successor:employees!succession_planning_successor_id_fkey(id, first_name, last_name, position)")
        .eq("position_id", employeeId);
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Update Talentpool Status
  const updateTalentPoolStatus = useMutation({
    mutationFn: async (data: any) => {
      if (!companyId) throw new Error("Company ID fehlt");
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("talent_pool_status")
        .upsert({ 
          ...data, 
          employee_id: employeeId,
          company_id: companyId,
          updated_by: user?.user?.id 
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-pool-status"] });
      toast({ title: "Talentpool-Status aktualisiert" });
    },
    onError: (error: any) => {
      console.error('Talent pool error:', error);
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    },
  });

  // Add Career Goal
  const addCareerGoal = useMutation({
    mutationFn: async (data: any) => {
      if (!companyId) throw new Error("Company ID fehlt");
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("career_goals")
        .insert({ 
          ...data, 
          employee_id: employeeId,
          company_id: companyId,
          created_by: user?.user?.id 
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-goals"] });
      toast({ title: "Entwicklungsziel hinzugefügt" });
    },
    onError: (error: any) => {
      console.error('Career goal error:', error);
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    },
  });

  // Update Career Goal
  const updateCareerGoal = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("career_goals")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-goals"] });
      toast({ title: "Entwicklungsziel aktualisiert" });
    },
  });

  // Delete Career Goal
  const deleteCareerGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("career_goals")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-goals"] });
      toast({ title: "Entwicklungsziel gelöscht" });
    },
  });

  return {
    talentPoolStatus,
    careerPath,
    careerGoals,
    competencyGaps,
    successionPlanning,
    isLoading: isLoadingTalent || isLoadingPath || isLoadingGoals || isLoadingGaps || isLoadingSuccession,
    updateTalentPoolStatus,
    addCareerGoal,
    updateCareerGoal,
    deleteCareerGoal,
  };
};
