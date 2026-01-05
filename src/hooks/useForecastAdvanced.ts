
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type {
  ForecastScenario,
  ForecastAIRecommendation,
  ForecastRiskAssessment,
  ForecastDashboardWidget,
  ForecastAISettings,
  ForecastDataConnector
} from '@/types/forecastAdvanced';

// Szenarien-Management
export const useForecastScenarios = (templateId?: string) => {
  return useQuery({
    queryKey: ['forecast-scenarios', templateId],
    queryFn: async () => {
      let query = supabase
        .from('forecast_scenarios')
        .select('*')
        .eq('is_active', true);
      
      if (templateId) {
        query = query.eq('base_template_id', templateId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ForecastScenario[];
    },
  });
};

export const useCreateForecastScenario = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (scenario: Partial<ForecastScenario>) => {
      const { data, error } = await supabase
        .from('forecast_scenarios')
        .insert([{ ...scenario, created_by: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data as ForecastScenario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-scenarios'] });
      toast({
        title: "Szenario erstellt",
        description: "Das Forecast-Szenario wurde erfolgreich erstellt.",
      });
    },
  });
};

// KI-Empfehlungen
export const useForecastAIRecommendations = (forecastInstanceId?: string) => {
  return useQuery({
    queryKey: ['forecast-ai-recommendations', forecastInstanceId],
    queryFn: async () => {
      let query = supabase
        .from('forecast_ai_recommendations')
        .select('*');
      
      if (forecastInstanceId) {
        query = query.eq('forecast_instance_id', forecastInstanceId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ForecastAIRecommendation[];
    },
    enabled: !!forecastInstanceId,
  });
};

export const useGenerateAIRecommendations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (forecastInstanceId: string) => {
      const { data, error } = await supabase.rpc('generate_forecast_ai_recommendations', {
        p_forecast_instance_id: forecastInstanceId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-ai-recommendations'] });
      toast({
        title: "KI-Empfehlungen generiert",
        description: "Neue KI-basierte Empfehlungen wurden erstellt.",
      });
    },
  });
};

// Risikobewertung
export const useForecastRiskAssessments = (forecastInstanceId?: string) => {
  return useQuery({
    queryKey: ['forecast-risk-assessments', forecastInstanceId],
    queryFn: async () => {
      let query = supabase
        .from('forecast_risk_assessments')
        .select('*')
        .eq('status', 'active');
      
      if (forecastInstanceId) {
        query = query.eq('forecast_instance_id', forecastInstanceId);
      }
      
      const { data, error } = await query.order('severity', { ascending: false });
      
      if (error) throw error;
      return data as ForecastRiskAssessment[];
    },
  });
};

export const useAssessForecastRisks = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (forecastInstanceId: string) => {
      const { data, error } = await supabase.rpc('assess_forecast_risks', {
        p_forecast_instance_id: forecastInstanceId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-risk-assessments'] });
      toast({
        title: "Risikobewertung durchgeführt",
        description: "Potenzielle Risiken wurden identifiziert und bewertet.",
      });
    },
  });
};

// Dashboard-Widgets
export const useForecastDashboardWidgets = () => {
  return useQuery({
    queryKey: ['forecast-dashboard-widgets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('forecast_dashboard_widgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_visible', true)
        .order('position_y')
        .order('position_x');
      
      if (error) throw error;
      return data as ForecastDashboardWidget[];
    },
  });
};

export const useUpdateDashboardWidget = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ForecastDashboardWidget> }) => {
      const { data, error } = await supabase
        .from('forecast_dashboard_widgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ForecastDashboardWidget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-dashboard-widgets'] });
    },
  });
};

// KI-Einstellungen
export const useForecastAISettings = () => {
  return useQuery({
    queryKey: ['forecast-ai-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('forecast_ai_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as ForecastAISettings | null;
    },
  });
};

export const useUpdateForecastAISettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<ForecastAISettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('forecast_ai_settings')
        .upsert({
          user_id: user.id,
          ...settings
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as ForecastAISettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-ai-settings'] });
      toast({
        title: "KI-Einstellungen gespeichert",
        description: "Ihre KI-Einstellungen wurden aktualisiert.",
      });
    },
  });
};

// Daten-Konnektoren
export const useForecastDataConnectors = () => {
  return useQuery({
    queryKey: ['forecast-data-connectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forecast_data_connectors')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as ForecastDataConnector[];
    },
  });
};
