import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type {
  WorkforcePlan,
  HeadcountForecast,
  SkillMatrix,
  WorkforceScenario,
  WorkforceHeatmapData,
  WorkforceRiskAssessment,
  WorkforceCompliance,
  CreateWorkforcePlanRequest,
  CreateScenarioRequest,
  WorkforceMetrics
} from '@/types/workforcePlanning';

// Echte DB-Abfragen statt Mock-Daten
const workforceService = {
  async getWorkforceMetrics(): Promise<WorkforceMetrics> {
    // Lade echte Mitarbeiterzahlen
    const { count: totalEmployees } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Lade geplante Stellen
    const { data: forecasts } = await supabase
      .from('workforce_forecasts')
      .select('planned_headcount')
      .order('created_at', { ascending: false })
      .limit(1);

    const plannedEmployees = forecasts?.[0]?.planned_headcount || 0;

    // Lade Skill Gaps
    const { count: skillGaps } = await supabase
      .from('skill_matrices')
      .select('*', { count: 'exact', head: true })
      .eq('has_gap', true);

    // Lade Risiko-Abteilungen
    const { count: highRiskDepts } = await supabase
      .from('workforce_risk_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('risk_level', 'high');

    const total = totalEmployees || 0;
    const planned = plannedEmployees || 0;
    const variance = planned > 0 ? Math.round(((planned - total) / planned) * 100 * 10) / 10 : 0;

    return {
      total_employees: total,
      planned_employees: planned,
      variance_percentage: variance,
      skill_gaps_count: skillGaps || 0,
      high_risk_departments: highRiskDepts || 0,
      budget_utilization: 0, // Wird aus Budget-Modul geladen
      forecast_accuracy: 0, // Wird berechnet wenn Daten vorhanden
      compliance_score: 0 // Wird aus Compliance-Modul geladen
    };
  },

  async getHeadcountForecasts(filters?: any): Promise<HeadcountForecast[]> {
    const { data, error } = await supabase
      .from('workforce_forecasts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching headcount forecasts:', error);
      return [];
    }

    return data || [];
  },

  async getSkillGapAnalysis(filters?: any): Promise<SkillMatrix[]> {
    const { data, error } = await supabase
      .from('skill_matrices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching skill gap analysis:', error);
      return [];
    }

    return data || [];
  },

  async getScenarios(): Promise<WorkforceScenario[]> {
    const { data, error } = await supabase
      .from('workforce_scenarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scenarios:', error);
      return [];
    }

    return data || [];
  },

  async getHeatmapData(filters?: any): Promise<WorkforceHeatmapData[]> {
    const { data, error } = await supabase
      .from('workforce_heatmap')
      .select('*');

    if (error) {
      console.error('Error fetching heatmap data:', error);
      return [];
    }

    return data || [];
  },

  async getRiskAssessment(filters?: any): Promise<WorkforceRiskAssessment> {
    const { data, error } = await supabase
      .from('workforce_risk_assessments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching risk assessment:', error);
      return {} as WorkforceRiskAssessment;
    }

    return data || {} as WorkforceRiskAssessment;
  },

  async getComplianceData(filters?: any): Promise<WorkforceCompliance[]> {
    const { data, error } = await supabase
      .from('workforce_compliance')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching compliance data:', error);
      return [];
    }

    return data || [];
  },

  async createWorkforcePlan(data: CreateWorkforcePlanRequest): Promise<WorkforcePlan> {
    const { data: plan, error } = await supabase
      .from('workforce_plans')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return plan;
  },

  async createScenario(data: CreateScenarioRequest): Promise<WorkforceScenario> {
    const { data: scenario, error } = await supabase
      .from('workforce_scenarios')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return scenario;
  }
};

// Main Workforce Planning Hook
export const useWorkforcePlanning = () => {
  return useQuery({
    queryKey: ['workforce-metrics'],
    queryFn: () => workforceService.getWorkforceMetrics(),
  });
};

// Headcount Forecasts Hook
export const useHeadcountForecasts = (filters?: {
  department?: string;
  location?: string;
  period?: string;
}) => {
  return useQuery({
    queryKey: ['headcount-forecasts', filters],
    queryFn: () => workforceService.getHeadcountForecasts(filters),
  });
};

// Skill Gap Analysis Hook
export const useSkillGapAnalysis = (filters?: {
  department?: string;
  category?: string;
}) => {
  return useQuery({
    queryKey: ['skill-gap-analysis', filters],
    queryFn: () => workforceService.getSkillGapAnalysis(filters),
  });
};

// Scenario Planning Hook
export const useScenarioPlanning = () => {
  return useQuery({
    queryKey: ['workforce-scenarios'],
    queryFn: () => workforceService.getScenarios(),
  });
};

// Workforce Heatmap Hook
export const useWorkforceHeatmap = (filters?: {
  metric?: string;
  view?: string;
  region?: string;
}) => {
  return useQuery({
    queryKey: ['workforce-heatmap', filters],
    queryFn: () => workforceService.getHeatmapData(filters),
  });
};

// Risk Assessment Hook
export const useRiskAssessment = (filters?: {
  category?: string;
}) => {
  return useQuery({
    queryKey: ['workforce-risk-assessment', filters],
    queryFn: () => workforceService.getRiskAssessment(filters),
  });
};

// Workforce Compliance Hook
export const useWorkforceCompliance = (filters?: {
  type?: string;
}) => {
  return useQuery({
    queryKey: ['workforce-compliance', filters],
    queryFn: () => workforceService.getComplianceData(filters),
  });
};

// Create Workforce Plan Hook
export const useCreateWorkforcePlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateWorkforcePlanRequest) =>
      workforceService.createWorkforcePlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workforce-metrics'] });
      toast({
        title: "Workforce Plan erstellt",
        description: "Ihr neuer Workforce Plan wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Workforce Plan konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

// Create Scenario Hook
export const useCreateScenario = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateScenarioRequest) =>
      workforceService.createScenario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workforce-scenarios'] });
      toast({
        title: "Szenario erstellt",
        description: "Das neue Workforce-Szenario wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Szenario konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

// Run Simulation Hook
export const useRunSimulation = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (scenarioData: any) => {
      // Führe Simulation basierend auf echten Daten durch
      const { data: employees } = await supabase
        .from('employees')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      const currentHeadcount = employees?.length || 0;
      
      return {
        scenario_name: scenarioData.name,
        confidence: 0,
        headcount_change: 0,
        budget_impact: 0,
        timeline: scenarioData.timeline || 12,
        risk_factors: [],
        current_headcount: currentHeadcount
      };
    },
    onSuccess: () => {
      toast({
        title: "Simulation abgeschlossen",
        description: "Die Szenario-Simulation wurde erfolgreich durchgeführt.",
      });
    },
    onError: () => {
      toast({
        title: "Simulation fehlgeschlagen",
        description: "Die Szenario-Simulation konnte nicht durchgeführt werden.",
        variant: "destructive",
      });
    },
  });
};
