import { useQuery } from "@tanstack/react-query";
import { supabase } from "../client";

export const useEmployeePerformanceData = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ["employee-performance", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      
      const [reviews, feedback360, developmentPlans, succession] = await Promise.all([
        supabase
          .from("employee_performance_reviews")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("year", 2025)
          .order("review_date", { ascending: true }),
        
        supabase
          .from("employee_360_feedback")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("year", 2025)
          .maybeSingle(),
        
        supabase
          .from("employee_development_plans")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("year", 2025)
          .order("priority", { ascending: false }),
        
        supabase
          .from("employee_succession_planning")
          .select("*")
          .eq("employee_id", employeeId)
          .maybeSingle(),
      ]);
      
      if (reviews.error) throw reviews.error;
      if (feedback360.error) throw feedback360.error;
      if (developmentPlans.error) throw developmentPlans.error;
      if (succession.error) throw succession.error;
      
      return {
        reviews: reviews.data || [],
        feedback360: feedback360.data,
        developmentPlans: developmentPlans.data || [],
        succession: succession.data,
      };
    },
    enabled: !!employeeId,
  });
};

export const usePerformanceHistory = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ["performance-history", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      
      const { data, error } = await supabase
        .from("employee_performance_reviews")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("review_type", "end_of_year")
        .order("year", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });
};

export const useInsuranceReminders = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ["insurance-reminders", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      
      const { data, error } = await supabase
        .from("employee_insurance_reminders")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("is_completed", false)
        .order("reminder_date", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });
};
