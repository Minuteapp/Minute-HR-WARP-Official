import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useEmploymentData = (employeeId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Skills
  const { data: skills, isLoading: isLoadingSkills } = useQuery({
    queryKey: ["employee-skills", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("employee_skills")
        .select("*")
        .eq("employee_id", employeeId)
        .order("skill_name", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Zertifikate
  const { data: certificates, isLoading: isLoadingCertificates } = useQuery({
    queryKey: ["employee-certificates", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("employee_certificates")
        .select("*")
        .eq("employee_id", employeeId)
        .order("issue_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Add Skill
  const addSkill = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("employee_skills")
        .insert({ ...data, employee_id: employeeId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-skills"] });
      toast({ title: "Skill hinzugefügt" });
    },
  });

  // Update Skill
  const updateSkill = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("employee_skills")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-skills"] });
      toast({ title: "Skill aktualisiert" });
    },
  });

  // Delete Skill
  const deleteSkill = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employee_skills")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-skills"] });
      toast({ title: "Skill gelöscht" });
    },
  });

  // Add Certificate
  const addCertificate = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("employee_certificates")
        .insert({ ...data, employee_id: employeeId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-certificates"] });
      toast({ title: "Zertifikat hinzugefügt" });
    },
  });

  // Update Certificate
  const updateCertificate = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("employee_certificates")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-certificates"] });
      toast({ title: "Zertifikat aktualisiert" });
    },
  });

  // Delete Certificate
  const deleteCertificate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employee_certificates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-certificates"] });
      toast({ title: "Zertifikat gelöscht" });
    },
  });

  return {
    skills,
    certificates,
    isLoading: isLoadingSkills || isLoadingCertificates,
    addSkill,
    updateSkill,
    deleteSkill,
    addCertificate,
    updateCertificate,
    deleteCertificate,
  };
};
