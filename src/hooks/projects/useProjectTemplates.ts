
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectTemplateService, ProjectTemplate } from './services/projectTemplateService';
import { toast } from 'sonner';

export const useProjectTemplates = (category?: string) => {
  const queryClient = useQueryClient();

  const {
    data: templates = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['project-templates', category],
    queryFn: () => projectTemplateService.getTemplates(category),
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['project-template-categories'],
    queryFn: () => projectTemplateService.getCategories(),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (template: Omit<ProjectTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'last_used_at'>) =>
      projectTemplateService.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-templates'] });
      queryClient.invalidateQueries({ queryKey: ['project-template-categories'] });
      toast.success('Template erfolgreich erstellt');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Fehler beim Erstellen des Templates');
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ProjectTemplate> }) =>
      projectTemplateService.updateTemplate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-templates'] });
      toast.success('Template erfolgreich aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error('Fehler beim Aktualisieren des Templates');
    },
  });

  const deactivateTemplateMutation = useMutation({
    mutationFn: (id: string) => projectTemplateService.deactivateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-templates'] });
      toast.success('Template erfolgreich deaktiviert');
    },
    onError: (error) => {
      console.error('Error deactivating template:', error);
      toast.error('Fehler beim Deaktivieren des Templates');
    },
  });

  const incrementUsageMutation = useMutation({
    mutationFn: (templateId: string) => projectTemplateService.incrementUsage(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-templates'] });
    },
    onError: (error) => {
      console.error('Error incrementing template usage:', error);
    },
  });

  return {
    templates,
    categories,
    isLoading,
    categoriesLoading,
    error,
    createTemplate: createTemplateMutation.mutateAsync,
    updateTemplate: updateTemplateMutation.mutateAsync,
    deactivateTemplate: deactivateTemplateMutation.mutateAsync,
    incrementUsage: incrementUsageMutation.mutateAsync,
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeactivating: deactivateTemplateMutation.isPending,
  };
};

export const useProjectTemplate = (id: string) => {
  const {
    data: template,
    isLoading,
    error
  } = useQuery({
    queryKey: ['project-template', id],
    queryFn: () => projectTemplateService.getTemplateById(id),
    enabled: !!id,
  });

  return {
    template,
    isLoading,
    error
  };
};
