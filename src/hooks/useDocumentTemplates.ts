
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentTemplateService } from '@/services/documentTemplateService';
import type { DocumentTemplate, DocumentTemplateInstance } from '@/types/documentTemplates';

export const useDocumentTemplates = (categoryFilter?: string) => {
  return useQuery({
    queryKey: ['document-templates', categoryFilter],
    queryFn: () => documentTemplateService.getTemplates(categoryFilter),
  });
};

export const useDocumentTemplate = (id: string) => {
  return useQuery({
    queryKey: ['document-template', id],
    queryFn: () => documentTemplateService.getTemplateById(id),
    enabled: !!id,
  });
};

export const useTemplateCategories = () => {
  return useQuery({
    queryKey: ['template-categories'],
    queryFn: () => documentTemplateService.getTemplateCategories(),
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: Partial<DocumentTemplate>) => 
      documentTemplateService.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DocumentTemplate> }) => 
      documentTemplateService.updateTemplate(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      queryClient.invalidateQueries({ queryKey: ['document-template', data.id] });
    },
  });
};

export const useDeactivateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentTemplateService.deactivateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
    },
  });
};

export const useTemplateInstances = (templateId?: string) => {
  return useQuery({
    queryKey: ['template-instances', templateId],
    queryFn: () => documentTemplateService.getTemplateInstances(templateId),
  });
};

export const useCreateTemplateInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      templateId, 
      formData, 
      placeholderValues 
    }: { 
      templateId: string; 
      formData?: Record<string, any>; 
      placeholderValues?: Record<string, any> 
    }) => documentTemplateService.createTemplateInstance(templateId, formData, placeholderValues),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-instances'] });
    },
  });
};

export const useUpdateTemplateInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DocumentTemplateInstance> }) => 
      documentTemplateService.updateTemplateInstance(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-instances'] });
    },
  });
};
