
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forecastService } from '@/services/budget/forecastService';
import { useToast } from '@/hooks/use-toast';
import type {
  ForecastTemplate,
  CreateForecastTemplateRequest,
  ForecastInstance
} from '@/types/forecastTemplates';

export const useForecastTemplates = (filters?: {
  category?: string;
  department?: string;
  is_active?: boolean;
}) => {
  return useQuery({
    queryKey: ['forecast-templates', filters],
    queryFn: () => forecastService.getTemplates(filters),
  });
};

export const useForecastTemplate = (id: string) => {
  return useQuery({
    queryKey: ['forecast-template', id],
    queryFn: () => forecastService.getTemplateById(id),
    enabled: !!id,
  });
};

export const useCreateForecastTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (template: CreateForecastTemplateRequest) =>
      forecastService.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-templates'] });
      toast({
        title: "Forecast-Vorlage erstellt",
        description: "Die Forecast-Vorlage wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Forecast-Vorlage konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateForecastTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ForecastTemplate> }) =>
      forecastService.updateTemplate(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forecast-templates'] });
      queryClient.invalidateQueries({ queryKey: ['forecast-template', data.id] });
      toast({
        title: "Vorlage aktualisiert",
        description: "Die Forecast-Vorlage wurde erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Vorlage konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useDuplicateForecastTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      forecastService.duplicateTemplate(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-templates'] });
      toast({
        title: "Vorlage dupliziert",
        description: "Die Forecast-Vorlage wurde erfolgreich dupliziert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Vorlage konnte nicht dupliziert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useSetDefaultTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, category }: { id: string; category: string }) =>
      forecastService.setAsDefault(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-templates'] });
      toast({
        title: "Standard-Vorlage gesetzt",
        description: "Die Vorlage wurde als Standard für neue Forecasts festgelegt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Standard-Vorlage konnte nicht gesetzt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useLockTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, locked }: { id: string; locked: boolean }) =>
      forecastService.lockTemplate(id, locked),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forecast-templates'] });
      toast({
        title: variables.locked ? "Vorlage gesperrt" : "Vorlage entsperrt",
        description: variables.locked 
          ? "Die Vorlage wurde gegen Änderungen gesperrt."
          : "Die Vorlage wurde für Änderungen freigegeben.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Sperrung konnte nicht geändert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useCreateForecastFromTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ templateId, params }: { 
      templateId: string; 
      params: {
        name: string;
        period_start: string;
        period_end: string;
        scenario?: string;
        parameter_overrides?: Record<string, number>;
      }
    }) => forecastService.createForecastFromTemplate(templateId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-instances'] });
      toast({
        title: "Forecast erstellt",
        description: "Der Forecast wurde erfolgreich aus der Vorlage erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Forecast konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useForecastInstances = (templateId?: string) => {
  return useQuery({
    queryKey: ['forecast-instances', templateId],
    queryFn: () => forecastService.getForecastInstances(templateId),
  });
};

// Diese Hooks wurden entfernt da die entsprechenden Service-Methoden nicht existieren
// export const useForecastTemplateVersions = (templateId?: string) => {
//   return useQuery({
//     queryKey: ['forecast-template-versions', templateId],
//     queryFn: () => forecastService.getTemplateVersions ? forecastService.getTemplateVersions(templateId!) : Promise.resolve([]),
//     enabled: !!templateId,
//   });
// };

// export const useForecastTemplateUsage = (templateId?: string) => {
//   return useQuery({
//     queryKey: ['forecast-template-usage', templateId],  
//     queryFn: () => forecastService.getTemplateUsage ? forecastService.getTemplateUsage(templateId!) : Promise.resolve([]),
//     enabled: !!templateId,
//   });
// };
