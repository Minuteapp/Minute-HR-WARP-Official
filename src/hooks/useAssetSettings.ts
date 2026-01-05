import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  AssetSettings, 
  AssetType, 
  AssetRoleRequirement, 
  AssetReturnChecklist,
  defaultAssetSettings 
} from "@/types/asset-settings";

export function useAssetSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['asset-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        return defaultAssetSettings as AssetSettings;
      }

      return {
        ...data,
        assignment_targets: data.assignment_targets || defaultAssetSettings.assignment_targets,
        escalation_recipients: data.escalation_recipients || defaultAssetSettings.escalation_recipients
      } as AssetSettings;
    }
  });

  const { data: assetTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['asset-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_types')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(type => ({
        ...type,
        custom_attributes: type.custom_attributes || [],
        required_attributes: type.required_attributes || []
      })) as AssetType[];
    }
  });

  const { data: roleRequirements, isLoading: requirementsLoading } = useQuery({
    queryKey: ['asset-role-requirements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_role_requirements')
        .select('*')
        .order('role_name');

      if (error) throw error;
      
      return (data || []).map(req => ({
        ...req,
        alternative_asset_types: req.alternative_asset_types || []
      })) as AssetRoleRequirement[];
    }
  });

  const { data: returnChecklists, isLoading: checklistsLoading } = useQuery({
    queryKey: ['asset-return-checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_return_checklists')
        .select('*')
        .order('name');

      if (error) throw error;
      
      return (data || []).map(checklist => ({
        ...checklist,
        items: checklist.items || []
      })) as AssetReturnChecklist[];
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<AssetSettings>) => {
      const { data: existing } = await supabase
        .from('asset_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('asset_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('asset_settings')
          .insert({
            ...defaultAssetSettings,
            ...updates
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-settings'] });
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Asset-Einstellungen wurden erfolgreich aktualisiert."
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
      console.error('Error updating asset settings:', error);
    }
  });

  const createAssetType = useMutation({
    mutationFn: async (assetType: Partial<AssetType>) => {
      const { error } = await supabase
        .from('asset_types')
        .insert(assetType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-types'] });
      toast({
        title: "Asset-Typ erstellt",
        description: "Der Asset-Typ wurde erfolgreich erstellt."
      });
    }
  });

  const updateAssetType = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AssetType> }) => {
      const { error } = await supabase
        .from('asset_types')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-types'] });
      toast({
        title: "Asset-Typ aktualisiert",
        description: "Der Asset-Typ wurde erfolgreich aktualisiert."
      });
    }
  });

  const deleteAssetType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('asset_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-types'] });
      toast({
        title: "Asset-Typ gelöscht",
        description: "Der Asset-Typ wurde erfolgreich gelöscht."
      });
    }
  });

  const createRoleRequirement = useMutation({
    mutationFn: async (requirement: Partial<AssetRoleRequirement>) => {
      const { error } = await supabase
        .from('asset_role_requirements')
        .insert(requirement);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-role-requirements'] });
      toast({
        title: "Anforderung erstellt",
        description: "Die Rollenanforderung wurde erfolgreich erstellt."
      });
    }
  });

  const updateRoleRequirement = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AssetRoleRequirement> }) => {
      const { error } = await supabase
        .from('asset_role_requirements')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-role-requirements'] });
    }
  });

  const deleteRoleRequirement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('asset_role_requirements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-role-requirements'] });
      toast({
        title: "Anforderung gelöscht",
        description: "Die Rollenanforderung wurde erfolgreich gelöscht."
      });
    }
  });

  const createReturnChecklist = useMutation({
    mutationFn: async (checklist: Partial<AssetReturnChecklist>) => {
      const { error } = await supabase
        .from('asset_return_checklists')
        .insert(checklist);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-return-checklists'] });
      toast({
        title: "Checkliste erstellt",
        description: "Die Rückgabe-Checkliste wurde erfolgreich erstellt."
      });
    }
  });

  const updateReturnChecklist = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AssetReturnChecklist> }) => {
      const { error } = await supabase
        .from('asset_return_checklists')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-return-checklists'] });
    }
  });

  const deleteReturnChecklist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('asset_return_checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-return-checklists'] });
      toast({
        title: "Checkliste gelöscht",
        description: "Die Rückgabe-Checkliste wurde erfolgreich gelöscht."
      });
    }
  });

  return {
    settings: settings || (defaultAssetSettings as AssetSettings),
    assetTypes: assetTypes || [],
    roleRequirements: roleRequirements || [],
    returnChecklists: returnChecklists || [],
    isLoading: settingsLoading || typesLoading || requirementsLoading || checklistsLoading,
    updateSettings: updateSettings.mutate,
    createAssetType: createAssetType.mutate,
    updateAssetType: updateAssetType.mutate,
    deleteAssetType: deleteAssetType.mutate,
    createRoleRequirement: createRoleRequirement.mutate,
    updateRoleRequirement: updateRoleRequirement.mutate,
    deleteRoleRequirement: deleteRoleRequirement.mutate,
    createReturnChecklist: createReturnChecklist.mutate,
    updateReturnChecklist: updateReturnChecklist.mutate,
    deleteReturnChecklist: deleteReturnChecklist.mutate,
    isSaving: updateSettings.isPending
  };
}
