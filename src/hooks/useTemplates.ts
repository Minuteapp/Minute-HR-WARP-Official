import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateService } from '@/services/templateService';
import { toast } from '@/hooks/use-toast';
import type { UniversalTemplate, CreateTemplateRequest } from '@/types/templates';

export const useTemplates = (category?: string) => {
  return useQuery({
    queryKey: ['templates', category],
    queryFn: () => templateService.getTemplates(category),
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => templateService.getTemplateById(id),
    enabled: !!id,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (template: CreateTemplateRequest) => {
      // Convert CreateTemplateRequest to Partial<UniversalTemplate>
      const universalTemplate: Partial<UniversalTemplate> = {
        ...template,
        version: 1,
        usage_count: 0,
        is_active: true,
        is_system_template: false,
        languages: template.languages || ['de'],
        permissions: [],
        tags: template.tags || []
      };
      return templateService.createTemplate(universalTemplate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: "Vorlage erstellt",
        description: "Die Vorlage wurde erfolgreich erstellt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Die Vorlage konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<UniversalTemplate> }) => 
      templateService.updateTemplate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: "Vorlage aktualisiert",
        description: "Die Vorlage wurde erfolgreich aktualisiert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Die Vorlage konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) => 
      templateService.duplicateTemplate(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: "Vorlage dupliziert",
        description: "Die Vorlage wurde erfolgreich dupliziert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Die Vorlage konnte nicht dupliziert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useTemplateStatistics = () => {
  return useQuery({
    queryKey: ['template-statistics'],
    queryFn: async () => {
      // Echte Daten aus der Datenbank laden
      const templates = await templateService.getTemplates();
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const newThisMonth = templates.filter(t => {
        const created = new Date(t.created_at || '');
        return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
      }).length;
      
      const mostUsed = templates
        .filter(t => t.usage_count && t.usage_count > 0)
        .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
        .slice(0, 5)
        .map(t => ({ name: t.name, usage_count: t.usage_count || 0 }));
      
      return {
        totalTemplates: templates.length,
        activeUsers: new Set(templates.map(t => t.created_by).filter(Boolean)).size,
        mostUsedTemplates: mostUsed.length > 0 ? mostUsed : [],
        newTemplatesThisMonth: newThisMonth
      };
    },
  });
};

export const useTemplateVersions = (templateId?: string) => {
  return useQuery({
    queryKey: ['template-versions', templateId],
    queryFn: () => templateService.getTemplateVersions(templateId!),
    enabled: !!templateId,
  });
};
