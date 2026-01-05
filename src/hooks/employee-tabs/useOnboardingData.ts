import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";

export const useOnboardingData = (employeeId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  // Checklisten
  const { data: checklists, isLoading: isLoadingChecklists } = useQuery({
    queryKey: ["onboarding-checklists", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("onboarding_checklists")
        .select("*")
        .eq("employee_id", employeeId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Meilensteine
  const { data: milestones, isLoading: isLoadingMilestones } = useQuery({
    queryKey: ["onboarding-milestones", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("onboarding_milestones")
        .select("*, responsible:employees!onboarding_milestones_responsible_person_id_fkey(id, first_name, last_name)")
        .eq("employee_id", employeeId)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Equipment
  const { data: equipment, isLoading: isLoadingEquipment } = useQuery({
    queryKey: ["equipment-assignments", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("equipment_assignments")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Buddy
  const { data: buddy, isLoading: isLoadingBuddy } = useQuery({
    queryKey: ["onboarding-buddy", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("onboarding_buddies")
        .select("*, buddy:employees!onboarding_buddies_buddy_id_fkey(id, first_name, last_name, email, position)")
        .eq("employee_id", employeeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Toggle Checklist Item
  const toggleChecklistItem = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("onboarding_checklists")
        .update({ 
          is_completed: isCompleted,
          completed_date: isCompleted ? new Date().toISOString() : null,
          completed_by: isCompleted ? user?.user?.id : null
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-checklists"] });
    },
  });

  // Add Checklist Item
  const addChecklistItem = useMutation({
    mutationFn: async (data: any) => {
      if (!companyId) throw new Error("Company ID fehlt");
      const { error } = await supabase
        .from("onboarding_checklists")
        .insert({ ...data, employee_id: employeeId, company_id: companyId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-checklists"] });
      toast({ title: "Checklisten-Punkt hinzugefügt" });
    },
    onError: (error: any) => {
      console.error('Onboarding error:', error);
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    },
  });

  // Update Equipment Status
  const updateEquipmentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("equipment_assignments")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment-assignments"] });
      toast({ title: "Equipment-Status aktualisiert" });
    },
  });

  // Assign Buddy
  const assignBuddy = useMutation({
    mutationFn: async (buddyId: string) => {
      const { error } = await supabase
        .from("onboarding_buddies")
        .upsert({
          employee_id: employeeId,
          buddy_id: buddyId,
          start_date: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-buddy"] });
      toast({ title: "Buddy zugewiesen" });
    },
  });

  return {
    checklists,
    milestones,
    equipment,
    buddy,
    isLoading: isLoadingChecklists || isLoadingMilestones || isLoadingEquipment || isLoadingBuddy,
    toggleChecklistItem,
    addChecklistItem,
    updateEquipmentStatus,
    assignBuddy,
  };
};
