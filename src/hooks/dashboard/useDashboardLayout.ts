import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardWidget {
  i: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config: {
    title: string;
    icon?: string;
    dataSource?: string;
    color?: string;
    actions?: string[];
  };
}

interface RoleTemplate {
  id: string;
  role_name: string;
  template_name: string;
  description: string;
  layout_config: {
    grid: { columns: number; rowHeight: number; gap: number };
    widgets: DashboardWidget[];
  };
  is_default: boolean;
  is_customizable: boolean;
}

export const useDashboardLayout = (userId: string | undefined, userRole: string) => {
  const queryClient = useQueryClient();
  const [currentLayout, setCurrentLayout] = useState<DashboardWidget[]>([]);

  // Fetch role templates
  const { data: roleTemplates = [] } = useQuery({
    queryKey: ['dashboard-role-templates', userRole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_role_templates')
        .select('*')
        .eq('role_name', userRole)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data as RoleTemplate[];
    },
    enabled: !!userRole
  });

  // Fetch user custom layout
  const { data: userLayout } = useQuery({
    queryKey: ['user-dashboard-layout', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_dashboard_layouts')
        .select('*, dashboard_role_templates(*)')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  // Get default template for role
  const defaultTemplate = roleTemplates.find(t => t.is_default);

  // Load layout on mount
  useEffect(() => {
    if (userLayout?.custom_widget_positions && userLayout.is_custom) {
      setCurrentLayout(userLayout.custom_widget_positions);
    } else if (defaultTemplate?.layout_config?.widgets) {
      setCurrentLayout(defaultTemplate.layout_config.widgets);
    }
  }, [userLayout, defaultTemplate]);

  // Save custom layout
  const saveLayoutMutation = useMutation({
    mutationFn: async (widgets: DashboardWidget[]) => {
      if (!userId) throw new Error('User ID required');

      const { data: existing } = await supabase
        .from('user_dashboard_layouts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_dashboard_layouts')
          .update({
            custom_widget_positions: widgets,
            is_custom: true,
            preferences: { lastUpdated: new Date().toISOString() }
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_dashboard_layouts')
          .insert({
            user_id: userId,
            custom_widget_positions: widgets,
            is_custom: true,
            hidden_widgets: [],
            preferences: { lastUpdated: new Date().toISOString() }
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-dashboard-layout'] });
      toast.success('Layout gespeichert');
    },
    onError: (error) => {
      console.error('Fehler beim Speichern:', error);
      toast.error('Fehler beim Speichern des Layouts');
    }
  });

  // Apply template
  const applyTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const template = roleTemplates.find(t => t.id === templateId);
      if (!template) throw new Error('Template nicht gefunden');

      if (!userId) throw new Error('User ID required');

      const { data: existing } = await supabase
        .from('user_dashboard_layouts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      const layoutData = {
        user_id: userId,
        base_template_id: templateId,
        custom_widget_positions: template.layout_config.widgets,
        is_custom: false,
        hidden_widgets: [],
        preferences: { appliedTemplate: template.template_name }
      };

      if (existing) {
        const { error } = await supabase
          .from('user_dashboard_layouts')
          .update(layoutData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_dashboard_layouts')
          .insert(layoutData);

        if (error) throw error;
      }

      setCurrentLayout(template.layout_config.widgets);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-dashboard-layout'] });
      toast.success('Vorlage angewendet');
    },
    onError: (error) => {
      console.error('Fehler beim Anwenden der Vorlage:', error);
      toast.error('Fehler beim Anwenden der Vorlage');
    }
  });

  // Reset to default
  const resetToDefaultMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { error } = await supabase
        .from('user_dashboard_layouts')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      if (defaultTemplate?.layout_config?.widgets) {
        setCurrentLayout(defaultTemplate.layout_config.widgets);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-dashboard-layout'] });
      toast.success('Auf Standardvorlage zurückgesetzt');
    }
  });

  return {
    currentLayout,
    setCurrentLayout,
    roleTemplates,
    defaultTemplate,
    saveLayout: saveLayoutMutation.mutate,
    applyTemplate: applyTemplateMutation.mutate,
    resetToDefault: resetToDefaultMutation.mutate,
    isSaving: saveLayoutMutation.isPending,
    isCustom: userLayout?.is_custom || false
  };
};
