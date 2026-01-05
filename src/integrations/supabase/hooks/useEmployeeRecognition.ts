import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmployeeAward {
  id: string;
  employee_id: string;
  award_type: 'employee_of_year' | 'employee_of_month' | 'top_performer';
  award_name: string;
  award_category: string | null;
  received_date: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' | null;
  year: number;
  description: string | null;
  badge_color: 'yellow' | 'orange' | 'blue' | 'green' | 'gray' | null;
  badge_label: string | null;
  performance_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface TenureMilestone {
  id: string;
  employee_id: string;
  tenure_years: number;
  start_date: string;
  current_milestone_reached: boolean;
  next_milestone_years: number | null;
  next_milestone_date: string | null;
  milestone_status: 'gefeiert' | 'zukünftig' | null;
  gift_amount: number | null;
  gift_currency: string | null;
  extra_vacation_days: number | null;
  celebrated_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamAward {
  id: string;
  employee_id: string;
  team_id: string | null;
  award_name: string;
  award_category: string | null;
  received_date: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' | null;
  year: number;
  description: string | null;
  badge_color: 'yellow' | 'orange' | 'blue' | 'green' | 'gray' | null;
  badge_label: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectAchievement {
  id: string;
  employee_id: string;
  project_id: string | null;
  project_name: string;
  role: string;
  year: number;
  description: string | null;
  impact_metrics: any;
  badge_year: number | null;
  created_at: string;
  updated_at: string;
}

export interface PeerKudos {
  id: string;
  sender_employee_id: string;
  receiver_employee_id: string;
  kudos_message: string;
  category: 'teamwork' | 'innovation' | 'excellence' | 'leadership';
  badge_type: string | null;
  sent_date: string;
  created_at: string;
}

export interface KudosSummary {
  id: string;
  employee_id: string;
  year: number;
  kudos_received_count: number;
  kudos_received_this_year: number;
  kudos_sent_count: number;
  top_category: string | null;
  top_category_count: number;
  created_at: string;
  updated_at: string;
}

export interface PotentialAward {
  id: string;
  employee_id: string;
  year: number;
  award_name: string;
  award_category: string | null;
  probability_score: number | null;
  progress_percentage: number | null;
  criteria_description: string | null;
  status: 'potential' | 'in_review' | 'achieved';
  created_at: string;
  updated_at: string;
}

export const useEmployeeAwards = (employeeId: string) => {
  return useQuery({
    queryKey: ['employee-awards', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_awards')
        .select('*')
        .eq('employee_id', employeeId)
        .order('received_date', { ascending: false });

      if (error) throw error;
      return data as EmployeeAward[];
    },
  });
};

export const useEmployeeTenure = (employeeId: string) => {
  return useQuery({
    queryKey: ['employee-tenure', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_tenure_milestones')
        .select('*')
        .eq('employee_id', employeeId)
        .order('tenure_years', { ascending: true });

      if (error) throw error;
      return data as TenureMilestone[];
    },
  });
};

export const useTeamAwards = (employeeId: string) => {
  return useQuery({
    queryKey: ['team-awards', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_team_awards')
        .select('*')
        .eq('employee_id', employeeId)
        .order('received_date', { ascending: false });

      if (error) throw error;
      return data as TeamAward[];
    },
  });
};

export const useProjectAchievements = (employeeId: string) => {
  return useQuery({
    queryKey: ['project-achievements', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_project_achievements')
        .select('*')
        .eq('employee_id', employeeId)
        .order('year', { ascending: false });

      if (error) throw error;
      return data as ProjectAchievement[];
    },
  });
};

export const useEmployeeKudos = (employeeId: string, limit: number = 3) => {
  return useQuery({
    queryKey: ['employee-kudos', employeeId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_peer_kudos')
        .select('*')
        .eq('receiver_employee_id', employeeId)
        .order('sent_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as PeerKudos[];
    },
  });
};

export const useKudosSummary = (employeeId: string, year: number = new Date().getFullYear()) => {
  return useQuery({
    queryKey: ['kudos-summary', employeeId, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_kudos_summary')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('year', year)
        .single();

      if (error) throw error;
      return data as KudosSummary;
    },
  });
};

export const usePotentialAwards = (employeeId: string, year: number = new Date().getFullYear()) => {
  return useQuery({
    queryKey: ['potential-awards', employeeId, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_potential_awards')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('year', year)
        .order('year', { ascending: true });

      if (error) throw error;
      return data as PotentialAward[];
    },
  });
};

export const useSendKudosMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      sender_employee_id: string;
      receiver_employee_id: string;
      kudos_message: string;
      category: 'teamwork' | 'innovation' | 'excellence' | 'leadership';
    }) => {
      const { data: result, error } = await supabase
        .from('employee_peer_kudos')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-kudos'] });
      queryClient.invalidateQueries({ queryKey: ['kudos-summary'] });
      toast({
        title: "Kudos gesendet!",
        description: "Deine Anerkennung wurde erfolgreich übermittelt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Kudos konnten nicht gesendet werden.",
        variant: "destructive",
      });
    },
  });
};
