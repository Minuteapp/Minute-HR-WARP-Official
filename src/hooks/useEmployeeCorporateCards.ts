import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CorporateCard {
  id: string;
  employee_id: string;
  card_type: string;
  card_number_masked: string;
  holder_name: string;
  usage_category: string | null;
  valid_until: string | null;
  issued_date: string | null;
  monthly_limit: number;
  current_usage: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useEmployeeCorporateCards = (employeeId: string) => {
  return useQuery({
    queryKey: ['employee-corporate-cards', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_corporate_cards')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Fehler beim Laden der Firmenkreditkarten:', error);
        throw error;
      }
      
      return data as CorporateCard[];
    },
    enabled: !!employeeId,
  });
};
