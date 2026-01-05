import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAwardsData = (employeeId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: awards = [], isLoading } = useQuery({
    queryKey: ["employee-awards", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("employee_awards")
        .select("*")
        .eq("employee_id", employeeId)
        .order("awarded_date", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // Gruppiere nach Jahr
  const byYear = awards.reduce((acc, award) => {
    const year = new Date(award.awarded_date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(award);
    return acc;
  }, {} as Record<string, typeof awards>);

  // Gruppiere nach Kategorie
  const byCategory = awards.reduce((acc, award) => {
    const category = award.award_category || "Sonstiges";
    if (!acc[category]) acc[category] = [];
    acc[category].push(award);
    return acc;
  }, {} as Record<string, typeof awards>);

  const statistics = {
    total: awards.length,
    thisYear: awards.filter(a => new Date(a.awarded_date).getFullYear() === new Date().getFullYear()).length,
    byCategory: Object.keys(byCategory).reduce((acc, key) => {
      acc[key] = byCategory[key].length;
      return acc;
    }, {} as Record<string, number>),
  };

  const addAward = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("employee_awards")
        .insert({ ...data, employee_id: employeeId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-awards"] });
      toast({ title: "Auszeichnung hinzugefügt" });
    },
  });

  const updateAward = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("employee_awards")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-awards"] });
      toast({ title: "Auszeichnung aktualisiert" });
    },
  });

  const deleteAward = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employee_awards")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-awards"] });
      toast({ title: "Auszeichnung gelöscht" });
    },
  });

  return {
    awards,
    byYear,
    byCategory,
    statistics,
    isLoading,
    addAward,
    updateAward,
    deleteAward,
  };
};
