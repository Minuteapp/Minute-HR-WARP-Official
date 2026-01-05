import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types für das erweiterte Workforce Planning
export interface WFDemand {
  id: string;
  project_id?: string;
  role_name: string;
  required_skills: string[];
  required_certifications: string[];
  hours_needed: number;
  start_date: string;
  end_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location_id?: string;
  department?: string;
  cost_center?: string;
  status: 'open' | 'partial' | 'fulfilled' | 'cancelled';
  created_by?: string;
  created_at: string;
  updated_at: string;
  company_id?: string;
  metadata: Record<string, any>;
}

export interface WFSupply {
  id: string;
  user_id: string;
  available_hours: number;
  skills: string[];
  certifications: Record<string, any>[];
  cost_rate: number;
  location_id?: string;
  department?: string;
  availability_start: string;
  availability_end: string;
  preferences: Record<string, any>;
  constraints: Record<string, any>;
  status: 'available' | 'partial' | 'unavailable' | 'on_leave';
  created_at: string;
  updated_at: string;
  company_id?: string;
  metadata: Record<string, any>;
}

export interface WFGap {
  id: string;
  demand_id?: string;
  gap_hours: number;
  gap_fte: number;
  missing_skills: string[];
  missing_certifications: string[];
  location?: string;
  department?: string;
  week_start: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution_suggestions: any[];
  cost_impact: number;
  created_at: string;
  company_id?: string;
  metadata: Record<string, any>;
}

export interface WFScenario {
  id: string;
  name: string;
  description?: string;
  scenario_type: 'base' | 'best' | 'worst' | 'custom';
  assumptions: Record<string, any>;
  forecast_data: Record<string, any>;
  cost_projection: number;
  headcount_projection: number;
  overtime_projection: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  company_id?: string;
  metadata: Record<string, any>;
}

export interface WFAssignment {
  id: string;
  demand_id?: string;
  user_id: string;
  assigned_hours: number;
  assignment_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  status: 'planned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  conflict_level: 'none' | 'low' | 'medium' | 'high';
  compliance_status: 'compliant' | 'warning' | 'violation';
  compliance_notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  company_id?: string;
  metadata: Record<string, any>;
}

export interface WFRequest {
  id: string;
  request_type: 'hiring' | 'training' | 'contract_change' | 'certification' | 'equipment';
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_review' | 'approved' | 'rejected' | 'completed';
  requested_by?: string;
  assigned_to?: string;
  department?: string;
  cost_estimate: number;
  roi_estimate: number;
  time_to_fill_days?: number;
  request_data: Record<string, any>;
  approval_chain: any[];
  due_date?: string;
  created_at: string;
  updated_at: string;
  company_id?: string;
  metadata: Record<string, any>;
}

export interface WFSkillsMatrix {
  id: string;
  user_id: string;
  skill_name: string;
  skill_level: number;
  certification_name?: string;
  certification_level?: string;
  acquired_date?: string;
  expiry_date?: string;
  verified_by?: string;
  verification_date?: string;
  status: 'active' | 'expired' | 'pending' | 'revoked';
  created_at: string;
  updated_at: string;
  company_id?: string;
  metadata: Record<string, any>;
}

export const useWorkforceExtended = () => {
  const queryClient = useQueryClient();

  // Workforce Demand - MIT TENANT ISOLATION
  const { data: demands, isLoading: demandsLoading } = useQuery({
    queryKey: ['wf-demands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_demand')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WFDemand[];
    },
  });

  // Workforce Supply - MIT TENANT ISOLATION
  const { data: supplies, isLoading: suppliesLoading } = useQuery({
    queryKey: ['wf-supplies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_supply')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WFSupply[];
    },
  });

  // Workforce Gaps - MIT TENANT ISOLATION
  const { data: gaps, isLoading: gapsLoading } = useQuery({
    queryKey: ['wf-gaps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_gap')
        .select('*')
        .order('week_start', { ascending: false });
      
      if (error) throw error;
      return data as WFGap[];
    },
  });

  // Workforce Scenarios
  const { data: scenarios, isLoading: scenariosLoading } = useQuery({
    queryKey: ['wf-scenarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_scenario')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WFScenario[];
    },
  });

  // Workforce Assignments
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['wf-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_assignment')
        .select('*')
        .order('assignment_date', { ascending: false });
      
      if (error) throw error;
      return data as WFAssignment[];
    },
  });

  // Workforce Requests
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['wf-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_request')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WFRequest[];
    },
  });

  // Skills Matrix
  const { data: skillsMatrix, isLoading: skillsLoading } = useQuery({
    queryKey: ['wf-skills-matrix'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_skills_matrix')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WFSkillsMatrix[];
    },
  });

  // Mutations
  const createDemand = useMutation({
    mutationFn: async (demand: Partial<WFDemand>) => {
      const { data, error } = await supabase
        .from('wf_demand')
        .insert(demand)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wf-demands'] });
    },
  });

  const createRequest = useMutation({
    mutationFn: async (request: Partial<WFRequest>) => {
      const { data, error } = await supabase
        .from('wf_request')
        .insert(request)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wf-requests'] });
    },
  });

  const updateAssignment = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WFAssignment> }) => {
      const { data, error } = await supabase
        .from('wf_assignment')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wf-assignments'] });
    },
  });

  const activateScenario = useMutation({
    mutationFn: async (scenarioId: string) => {
      // Deactivate all scenarios first
      await supabase
        .from('wf_scenario')
        .update({ is_active: false })
        .neq('id', scenarioId);

      // Activate the selected scenario
      const { data, error } = await supabase
        .from('wf_scenario')
        .update({ is_active: true })
        .eq('id', scenarioId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wf-scenarios'] });
    },
  });

  // Dashboard KPIs
  const gapToday = gaps?.reduce((sum, gap) => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date(gap.week_start);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const todayDate = new Date(today);
    
    if (todayDate >= weekStart && todayDate <= weekEnd) {
      return sum + gap.gap_hours;
    }
    return sum;
  }, 0) || 0;

  const coverageThisWeek = supplies && demands ? 
    (supplies.reduce((sum, s) => sum + s.available_hours, 0) / 
     Math.max(demands.reduce((sum, d) => sum + d.hours_needed, 0), 1)) * 100 : 0;

  const expiringCerts = skillsMatrix?.filter(skill => {
    if (!skill.expiry_date) return false;
    const expiryDate = new Date(skill.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow && skill.status === 'active';
  }) || [];

  const topGaps = gaps?.slice(0, 5).map(gap => ({
    id: gap.id,
    name: `${gap.department || 'Unbekannt'} - ${gap.missing_skills.join(', ') || 'Allgemein'}`,
    hours: gap.gap_hours,
    severity: gap.severity
  })) || [];

  return {
    // Data
    demands,
    supplies,
    gaps,
    scenarios,
    assignments,
    requests,
    skillsMatrix,
    
    // Loading states
    isLoading: demandsLoading || suppliesLoading || gapsLoading || 
               scenariosLoading || assignmentsLoading || requestsLoading || skillsLoading,
    
    // KPIs für Dashboard
    dashboardKPIs: {
      gapToday,
      coverageThisWeek,
      expiringCerts,
      topGaps,
      overtimeRisk: assignments?.filter(a => a.conflict_level !== 'none').length || 0,
      openRequests: requests?.filter(r => r.status === 'open').length || 0,
    },
    
    // Mutations
    createDemand,
    createRequest,
    updateAssignment,
    activateScenario,
  };
};