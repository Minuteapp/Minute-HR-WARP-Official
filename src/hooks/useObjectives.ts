import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ObjectivesService } from '@/services/objectivesService';
import type {
  Objective,
  CreateObjectiveInput,
  UpdateObjectiveInput,
  ObjectiveFilters,
  ObjectiveDashboardData,
  ObjectiveFormState,
  RiskAssessment,
  ObjectiveSuggestion
} from '@/types/objectives';
import { toast } from 'sonner';

export const useObjectivesDashboard = () => {
  return useQuery({
    queryKey: ['objectives-dashboard'],
    queryFn: ObjectivesService.getDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useObjectives = (filters?: ObjectiveFilters) => {
  return useQuery({
    queryKey: ['objectives', filters],
    queryFn: () => ObjectivesService.getObjectives(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useObjective = (id: string) => {
  return useQuery({
    queryKey: ['objective', id],
    queryFn: () => ObjectivesService.getObjective(id),
    enabled: !!id,
  });
};

export const useCreateObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ObjectivesService.createObjective,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objectives-dashboard'] });
      toast.success('Ziel erfolgreich erstellt');
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Erstellen: ${error.message}`);
    },
  });
};

export const useUpdateObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ObjectivesService.updateObjective,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objective', data.id] });
      queryClient.invalidateQueries({ queryKey: ['objectives-dashboard'] });
      toast.success('Ziel erfolgreich aktualisiert');
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`);
    },
  });
};

export const useDeleteObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ObjectivesService.deleteObjective,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objectives-dashboard'] });
      toast.success('Ziel erfolgreich gelöscht');
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });
};

export const useObjectiveSuggestions = (userId?: string) => {
  return useQuery({
    queryKey: ['objective-suggestions', userId],
    queryFn: () => ObjectivesService.getSuggestions(userId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRiskAssessment = (objectiveId: string) => {
  return useQuery({
    queryKey: ['risk-assessment', objectiveId],
    queryFn: () => ObjectivesService.calculateRiskScore(objectiveId),
    enabled: !!objectiveId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useObjectiveFormWizard = () => {
  const [formState, setFormState] = useState<ObjectiveFormState>({
    currentStep: 1,
    totalSteps: 4,
    data: {
      objective_type: 'okr',
      priority: 'medium',
      key_results: []
    },
    validation: {},
    suggestions: [],
    isSubmitting: false
  });

  const nextStep = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps)
    }));
  }, []);

  const prevStep = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }));
  }, []);

  const updateData = useCallback((updates: Partial<CreateObjectiveInput>) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates }
    }));
  }, []);

  const updateKeyResults = useCallback((keyResults: any[]) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, key_results: keyResults }
    }));
  }, []);

  const setValidation = useCallback((validation: Record<string, string[]>) => {
    setFormState(prev => ({
      ...prev,
      validation
    }));
  }, []);

  const setSuggestions = useCallback((suggestions: ObjectiveSuggestion[]) => {
    setFormState(prev => ({
      ...prev,
      suggestions
    }));
  }, []);

  const setRiskAssessment = useCallback((riskAssessment: RiskAssessment) => {
    setFormState(prev => ({
      ...prev,
      riskAssessment
    }));
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState(prev => ({
      ...prev,
      isSubmitting
    }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const errors: Record<string, string[]> = {};

    switch (step) {
      case 1: // Basisdaten
        if (!formState.data.title?.trim()) {
          errors.title = ['Titel ist erforderlich'];
        } else if (formState.data.title.length < 5) {
          errors.title = ['Titel muss mindestens 5 Zeichen lang sein'];
        }
        
        if (!formState.data.period_start) {
          errors.period_start = ['Startdatum ist erforderlich'];
        }
        
        if (!formState.data.period_end) {
          errors.period_end = ['Enddatum ist erforderlich'];
        }
        
        if (formState.data.period_start && formState.data.period_end) {
          if (new Date(formState.data.period_start) >= new Date(formState.data.period_end)) {
            errors.period_end = ['Enddatum muss nach dem Startdatum liegen'];
          }
        }
        break;

      case 2: // Key Results
        if (!formState.data.key_results?.length) {
          errors.key_results = ['Mindestens ein Key Result ist erforderlich'];
        } else {
          formState.data.key_results.forEach((kr, index) => {
            if (!kr.metric?.trim()) {
              errors[`key_result_${index}_metric`] = ['Metrik ist erforderlich'];
            }
            if (!kr.target_value || kr.target_value <= 0) {
              errors[`key_result_${index}_target`] = ['Zielwert muss größer als 0 sein'];
            }
          });
        }
        break;

      case 3: // Ressourcen & Verlinkungen
        // Keine Pflichtfelder, aber Warnungen
        break;

      case 4: // Genehmigungen
        // Keine Pflichtfelder
        break;
    }

    setValidation(errors);
    return Object.keys(errors).length === 0;
  }, [formState.data, setValidation]);

  const resetForm = useCallback(() => {
    setFormState({
      currentStep: 1,
      totalSteps: 4,
      data: {
        objective_type: 'okr',
        priority: 'medium',
        key_results: []
      },
      validation: {},
      suggestions: [],
      isSubmitting: false
    });
  }, []);

  return {
    formState,
    nextStep,
    prevStep,
    updateData,
    updateKeyResults,
    validateStep,
    resetForm,
    setSuggestions,
    setRiskAssessment,
    setSubmitting
  };
};

export const useApproveObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, comments }: { objectiveId: string; comments?: string }) =>
      ObjectivesService.approveObjective(objectiveId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objectives-dashboard'] });
      toast.success('Ziel erfolgreich genehmigt');
    },
    onError: (error: any) => {
      toast.error(`Fehler bei der Genehmigung: ${error.message}`);
    },
  });
};

export const useAddObjectiveComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, comment }: { objectiveId: string; comment: string }) =>
      ObjectivesService.addComment(objectiveId, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['objective', variables.objectiveId] });
      toast.success('Kommentar hinzugefügt');
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Hinzufügen des Kommentars: ${error.message}`);
    },
  });
};