
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forecastService } from '@/services/budget/forecastService';
import { useToast } from '@/hooks/use-toast';
import type {
  ForecastScenario,
  ForecastAIRecommendation,
  ForecastRiskAssessment,
  ForecastDataConnector
} from '@/types/forecastAdvanced';
import type {
  EnterpriseForcast,
  CreateEnterpriseForcastRequest
} from '@/types/budgetEnterprise';

export const useEnterpriseForecasts = (filters?: {
  dimension_type?: string;
  scenario_type?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['enterprise-forecasts', filters],
    queryFn: () => forecastService.getEnterpriseForecasts(filters),
  });
};

export const useCreateEnterpriseForecast = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: CreateEnterpriseForcastRequest) =>
      forecastService.createEnterpriseForecast(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-forecasts'] });
      toast({
        title: "Enterprise Forecast erstellt",
        description: "Der erweiterte Forecast wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Enterprise Forecast konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

// Forecast Szenarien Hooks
export const useForecastScenarios = (templateId?: string) => {
  return useQuery({
    queryKey: ['forecast-scenarios', templateId],
    queryFn: () => forecastService.getScenarios(templateId),
  });
};

export const useCreateForecastScenario = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (scenario: Partial<ForecastScenario>) =>
      forecastService.createScenario(scenario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-scenarios'] });
      toast({
        title: "Forecast-Szenario erstellt",
        description: "Das neue Szenario wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Forecast-Szenario konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

// KI-Empfehlungen Hooks
export const useForecastAIRecommendations = (forecastInstanceId?: string) => {
  return useQuery({
    queryKey: ['forecast-ai-recommendations', forecastInstanceId],
    queryFn: () => forecastService.getAIRecommendations(forecastInstanceId),
  });
};

export const useUpdateRecommendationStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      forecastService.updateRecommendationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-ai-recommendations'] });
      toast({
        title: "Status aktualisiert",
        description: "Der Empfehlungsstatus wurde erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};

// Risikobewertung Hooks
export const useForecastRiskAssessments = (forecastInstanceId?: string) => {
  return useQuery({
    queryKey: ['forecast-risk-assessments', forecastInstanceId],
    queryFn: () => forecastService.getRiskAssessments(forecastInstanceId),
  });
};

export const useUpdateRiskStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status, resolutionNotes }: { 
      id: string; 
      status: string; 
      resolutionNotes?: string; 
    }) => forecastService.updateRiskStatus(id, status, resolutionNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-risk-assessments'] });
      toast({
        title: "Risikostatus aktualisiert",
        description: "Der Risikostatus wurde erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Risikostatus konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};

// Daten-Konnektoren Hooks
export const useForecastDataConnectors = () => {
  return useQuery({
    queryKey: ['forecast-data-connectors'],
    queryFn: () => forecastService.getDataConnectors(),
  });
};

export const useSyncDataConnector = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      forecastService.syncDataConnector(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-data-connectors'] });
      toast({
        title: "Synchronisation erfolgreich",
        description: "Der Daten-Konnektor wurde erfolgreich synchronisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Synchronisationsfehler",
        description: "Die Synchronisation konnte nicht durchgeführt werden.",
        variant: "destructive",
      });
    },
  });
};
