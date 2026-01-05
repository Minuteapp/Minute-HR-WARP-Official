import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OccupationalHealthExam {
  id: string;
  employee_id: string;
  exam_type: 'annual_checkup' | 'initial' | 'special';
  next_exam_date: string | null;
  last_exam_date: string | null;
  last_exam_result: 'passed' | 'failed' | 'pending' | null;
  company_doctor_name: string | null;
  exam_interval: 'yearly' | 'biannual' | 'triennial' | null;
  notes: string | null;
  status: 'scheduled' | 'completed' | 'overdue';
  created_at: string;
  updated_at: string;
}

export interface PreventiveMedicalExam {
  id: string;
  employee_id: string;
  exam_code: string;
  exam_name: string;
  exam_description: string | null;
  last_exam_date: string | null;
  next_exam_date: string | null;
  is_required: boolean;
  status: 'current' | 'upcoming' | 'overdue';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthProgram {
  id: string;
  employee_id: string;
  program_name: string;
  program_type: string;
  schedule: string | null;
  schedule_details: string | null;
  participation_status: 'participant' | 'available' | 'completed';
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkplaceErgonomics {
  id: string;
  employee_id: string;
  last_analysis_date: string | null;
  analysis_provider: string | null;
  analysis_result: 'passed' | 'needs_improvement' | null;
  ergonomic_chair: boolean;
  height_adjustable_desk: boolean;
  external_keyboard_mouse: boolean;
  adjustable_monitor: boolean;
  monitor_size: string | null;
  additional_equipment: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EAPAccess {
  id: string;
  employee_id: string;
  provider_name: string;
  provider_since: string | null;
  hours_per_year: number;
  hours_used: number;
  hotline_number: string | null;
  email: string | null;
  portal_url: string | null;
  available_topics: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthMetrics {
  id: string;
  employee_id: string;
  year: number;
  sick_days_count: number;
  sick_days_status: 'below_average' | 'average' | 'above_average' | null;
  gym_checkins_per_month: number;
  gym_status: 'inactive' | 'active' | 'very_active' | null;
  active_health_courses_count: number;
  courses_status: 'inactive' | 'active' | 'very_active' | null;
  prevention_bonus_earned: number;
  prevention_bonus_currency: string;
  health_score_percentage: number;
  health_score_status: 'good' | 'excellent' | 'outstanding' | null;
  created_at: string;
  updated_at: string;
}

export const useOccupationalHealthExams = (employeeId: string) => {
  return useQuery({
    queryKey: ['occupational-health-exams', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_occupational_health_exams')
        .select('*')
        .eq('employee_id', employeeId)
        .order('next_exam_date', { ascending: true });

      if (error) throw error;
      return data as OccupationalHealthExam[];
    },
  });
};

export const usePreventiveMedicalExams = (employeeId: string) => {
  return useQuery({
    queryKey: ['preventive-medical-exams', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_preventive_medical_exams')
        .select('*')
        .eq('employee_id', employeeId)
        .order('next_exam_date', { ascending: true });

      if (error) throw error;
      return data as PreventiveMedicalExam[];
    },
  });
};

export const useHealthPrograms = (employeeId: string) => {
  return useQuery({
    queryKey: ['health-programs', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_health_programs')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as HealthProgram[];
    },
  });
};

export const useWorkplaceErgonomics = (employeeId: string) => {
  return useQuery({
    queryKey: ['workplace-ergonomics', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_workplace_ergonomics')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (error) throw error;
      return data as WorkplaceErgonomics;
    },
  });
};

export const useEAPAccess = (employeeId: string) => {
  return useQuery({
    queryKey: ['eap-access', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_eap_access')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (error) throw error;
      return data as EAPAccess;
    },
  });
};

export const useHealthMetrics = (employeeId: string, year: number = new Date().getFullYear()) => {
  return useQuery({
    queryKey: ['health-metrics', employeeId, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_health_metrics')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('year', year)
        .single();

      if (error) throw error;
      return data as HealthMetrics;
    },
  });
};
