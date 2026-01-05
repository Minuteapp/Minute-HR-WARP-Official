
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalTemplateService } from '@/services/goalTemplateService';
import type { GoalTemplate, CreateGoalTemplateRequest } from '@/types/goalTemplates';
import { useToast } from '@/hooks/use-toast';

export const useGoalTemplates = (category?: string) => {
  return useQuery({
    queryKey: ['goal-templates', category],
    queryFn: () => goalTemplateService.getTemplates(category),
  });
};

export const useGoalTemplate = (id: string) => {
  return useQuery({
    queryKey: ['goal-template', id],
    queryFn: () => goalTemplateService.getTemplateById(id),
    enabled: !!id,
  });
};

export const usePublicGoalTemplates = () => {
  return useQuery({
    queryKey: ['goal-templates-public'],
    queryFn: () => goalTemplateService.getPublicTemplates(),
  });
};

export const useMyGoalTemplates = () => {
  return useQuery({
    queryKey: ['goal-templates-my'],
    queryFn: () => goalTemplateService.getMyTemplates(),
  });
};

export const useGoalTemplateCategories = () => {
  return useQuery({
    queryKey: ['goal-template-categories'],
    queryFn: () => goalTemplateService.getTemplateCategories(),
  });
};

export const usePopularGoalTemplates = (limit?: number) => {
  return useQuery({
    queryKey: ['goal-templates-popular', limit],
    queryFn: () => goalTemplateService.getPopularTemplates(limit),
  });
};

export const useCreateGoalTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (template: CreateGoalTemplateRequest) => 
      goalTemplateService.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-templates'] });
      toast({
        title: "Template erstellt",
        description: "Das Ziel-Template wurde erfolgreich erstellt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Das Template konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateGoalTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<GoalTemplate> }) => 
      goalTemplateService.updateTemplate(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goal-templates'] });
      queryClient.invalidateQueries({ queryKey: ['goal-template', data.id] });
      toast({
        title: "Template aktualisiert",
        description: "Das Template wurde erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Template konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteGoalTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => goalTemplateService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-templates'] });
      toast({
        title: "Template gelöscht",
        description: "Das Template wurde erfolgreich gelöscht.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Template konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });
};

export const useDuplicateGoalTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) => 
      goalTemplateService.duplicateTemplate(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-templates'] });
      toast({
        title: "Template dupliziert",
        description: "Das Template wurde erfolgreich dupliziert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Template konnte nicht dupliziert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useRecordTemplateUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, goalId }: { templateId: string; goalId: string }) => 
      goalTemplateService.recordTemplateUsage(templateId, goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-templates'] });
    },
  });
};

export const useSearchGoalTemplates = (query: string, filters?: any) => {
  return useQuery({
    queryKey: ['goal-templates-search', query, filters],
    queryFn: () => goalTemplateService.searchTemplates(query, filters),
    enabled: !!query,
  });
};

export const useCreateTemplateFromGoal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ goalId, templateData }: { goalId: string; templateData: any }) => 
      goalTemplateService.createTemplateFromGoal(goalId, templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-templates'] });
      toast({
        title: "Template erstellt",
        description: "Das Template wurde aus dem Ziel erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Template konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};
