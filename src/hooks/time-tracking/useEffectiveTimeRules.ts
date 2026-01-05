import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EffectiveTimeRulesResponse {
  user_id: string;
  date: string;
  country_code: string;
  rules: Record<string, any>;
  sources: string[];
}

interface UseEffectiveTimeRulesParams {
  userId?: string;
  date?: Date;
}

export const useEffectiveTimeRules = ({ userId, date }: UseEffectiveTimeRulesParams) => {
  const dateParam = date ? date.toISOString().slice(0, 10) : undefined; // YYYY-MM-DD

  const query = useQuery({
    queryKey: ["effective-time-rules", userId ?? "anonymous", dateParam ?? "today"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_effective_time_rules", {
        p_user_id: userId,
        ...(dateParam ? { p_date: dateParam } : {}),
      });

      if (error) throw error;
      return data as EffectiveTimeRulesResponse;
    },
    staleTime: 5 * 60 * 1000,
  });

  return query;
};
