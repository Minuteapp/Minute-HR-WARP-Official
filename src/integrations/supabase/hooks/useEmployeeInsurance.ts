import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../client";
import { useToast } from "@/hooks/use-toast";

export const useEmployeeInsuranceData = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ["employee-insurance", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      
      const [bav, health, disability, accident, life] = await Promise.all([
        supabase
          .from("employee_bav_insurance")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("status", "active")
          .maybeSingle(),
        
        supabase
          .from("employee_health_insurance")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("status", "active")
          .maybeSingle(),
        
        supabase
          .from("employee_disability_insurance")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("status", "active")
          .maybeSingle(),
        
        supabase
          .from("employee_accident_insurance")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("status", "active")
          .maybeSingle(),
        
        supabase
          .from("employee_life_insurance")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("status", "active")
          .maybeSingle(),
      ]);
      
      if (bav.error) throw bav.error;
      if (health.error) throw health.error;
      if (disability.error) throw disability.error;
      if (accident.error) throw accident.error;
      if (life.error) throw life.error;
      
      return {
        bav: bav.data,
        health: health.data,
        disability: disability.data,
        accident: accident.data,
        life: life.data,
      };
    },
    enabled: !!employeeId,
  });
};

// Update Mutations
export const useUpdateBAV = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("employee_bav_insurance")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-insurance"] });
      toast({
        title: "Gespeichert",
        description: "Die BAV-Daten wurden erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Änderungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateHealthInsurance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("employee_health_insurance")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-insurance"] });
      toast({
        title: "Gespeichert",
        description: "Die Krankenversicherungsdaten wurden erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Änderungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateDisability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("employee_disability_insurance")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-insurance"] });
      toast({
        title: "Gespeichert",
        description: "Die BU-Versicherungsdaten wurden erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Änderungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAccident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("employee_accident_insurance")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-insurance"] });
      toast({
        title: "Gespeichert",
        description: "Die Unfallversicherungsdaten wurden erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Änderungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateLife = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("employee_life_insurance")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-insurance"] });
      toast({
        title: "Gespeichert",
        description: "Die Lebensversicherungsdaten wurden erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Änderungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    },
  });
};
