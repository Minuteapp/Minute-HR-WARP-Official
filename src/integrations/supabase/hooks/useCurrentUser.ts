import { useQuery } from "@tanstack/react-query";
import { supabase } from "../client";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return null;
      
      // Hole Rolle des Benutzers
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role, company_id")
        .eq("user_id", user.id)
        .single();
      
      if (roleError) {
        console.error("Error fetching user role:", roleError);
        return { ...user, role: "employee", company_id: null };
      }
      
      return { ...user, role: roleData.role, company_id: roleData.company_id };
    },
  });
};
