import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OrgchartSettings, OrgchartVisibilityRule, defaultOrgchartSettings } from "@/types/orgchart-settings";

export function useOrgchartSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['orgchart-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orgchart_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        return defaultOrgchartSettings as OrgchartSettings;
      }

      return {
        ...data,
        enabled_unit_types: data.enabled_unit_types || defaultOrgchartSettings.enabled_unit_types,
        unit_type_order: data.unit_type_order || defaultOrgchartSettings.unit_type_order,
        unit_type_weights: data.unit_type_weights || {},
        custom_colors: data.custom_colors || {},
        zoom_levels: data.zoom_levels || defaultOrgchartSettings.zoom_levels,
        allowed_change_roles: data.allowed_change_roles || defaultOrgchartSettings.allowed_change_roles
      } as OrgchartSettings;
    }
  });

  const { data: visibilityRules, isLoading: rulesLoading } = useQuery({
    queryKey: ['orgchart-visibility-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orgchart_visibility_rules')
        .select('*')
        .order('role_type');

      if (error) throw error;
      
      return (data || []).map(rule => ({
        ...rule,
        visible_fields: rule.visible_fields || ['name', 'role', 'team'],
        hidden_fields: rule.hidden_fields || []
      })) as OrgchartVisibilityRule[];
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<OrgchartSettings>) => {
      const { data: existing } = await supabase
        .from('orgchart_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('orgchart_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('orgchart_settings')
          .insert({
            ...defaultOrgchartSettings,
            ...updates
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgchart-settings'] });
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Organigramm-Einstellungen wurden erfolgreich aktualisiert."
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
      console.error('Error updating orgchart settings:', error);
    }
  });

  const updateVisibilityRule = useMutation({
    mutationFn: async ({ id, updates }: { id?: string; updates: Partial<OrgchartVisibilityRule> }) => {
      if (id) {
        const { error } = await supabase
          .from('orgchart_visibility_rules')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('orgchart_visibility_rules')
          .insert(updates);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgchart-visibility-rules'] });
      toast({
        title: "Regel gespeichert",
        description: "Die Sichtbarkeitsregel wurde erfolgreich aktualisiert."
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Die Regel konnte nicht gespeichert werden.",
        variant: "destructive"
      });
      console.error('Error updating visibility rule:', error);
    }
  });

  const deleteVisibilityRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('orgchart_visibility_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgchart-visibility-rules'] });
      toast({
        title: "Regel gelöscht",
        description: "Die Sichtbarkeitsregel wurde erfolgreich gelöscht."
      });
    }
  });

  return {
    settings: settings || (defaultOrgchartSettings as OrgchartSettings),
    visibilityRules: visibilityRules || [],
    isLoading: settingsLoading || rulesLoading,
    updateSettings: updateSettings.mutate,
    updateVisibilityRule: updateVisibilityRule.mutate,
    deleteVisibilityRule: deleteVisibilityRule.mutate,
    isSaving: updateSettings.isPending || updateVisibilityRule.isPending
  };
}
