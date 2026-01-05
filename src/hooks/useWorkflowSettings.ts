import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  WorkflowGlobalSettings,
  WorkflowTrigger,
  WorkflowCondition,
  WorkflowAction,
  WorkflowApproverRule,
  WorkflowPermission,
} from '@/types/workflow-settings';

// ========== GLOBAL SETTINGS ==========

export function useWorkflowGlobalSettings(companyId?: string) {
  return useQuery({
    queryKey: ['workflow-global-settings', companyId],
    queryFn: async () => {
      let query = supabase.from('workflow_global_settings').select('*');
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data as WorkflowGlobalSettings | null;
    },
  });
}

export function useUpdateWorkflowGlobalSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      settings,
    }: {
      id?: string;
      settings: Partial<WorkflowGlobalSettings>;
    }) => {
      if (id) {
        const { data, error } = await supabase
          .from('workflow_global_settings')
          .update(settings as any)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('workflow_global_settings')
          .insert(settings as any)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-global-settings'] });
      toast.success('Workflow-Einstellungen gespeichert');
    },
    onError: (error) => {
      console.error('Error saving workflow settings:', error);
      toast.error('Fehler beim Speichern der Einstellungen');
    },
  });
}

// ========== TRIGGERS ==========

export function useWorkflowTriggers(companyId?: string) {
  return useQuery({
    queryKey: ['workflow-triggers', companyId],
    queryFn: async () => {
      let query = supabase.from('workflow_triggers').select('*').order('priority', { ascending: true });
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as WorkflowTrigger[];
    },
  });
}

export function useCreateWorkflowTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trigger: Partial<WorkflowTrigger>) => {
      const { data, error } = await supabase
        .from('workflow_triggers')
        .insert(trigger as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-triggers'] });
      toast.success('Trigger erstellt');
    },
    onError: (error) => {
      console.error('Error creating trigger:', error);
      toast.error('Fehler beim Erstellen des Triggers');
    },
  });
}

export function useUpdateWorkflowTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, trigger }: { id: string; trigger: Partial<WorkflowTrigger> }) => {
      const { data, error } = await supabase
        .from('workflow_triggers')
        .update(trigger as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-triggers'] });
      toast.success('Trigger aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating trigger:', error);
      toast.error('Fehler beim Aktualisieren des Triggers');
    },
  });
}

export function useDeleteWorkflowTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workflow_triggers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-triggers'] });
      toast.success('Trigger gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting trigger:', error);
      toast.error('Fehler beim Löschen des Triggers');
    },
  });
}

// ========== CONDITIONS ==========

export function useWorkflowConditions(templateId?: string) {
  return useQuery({
    queryKey: ['workflow-conditions', templateId],
    queryFn: async () => {
      let query = supabase.from('workflow_conditions').select('*').order('sort_order', { ascending: true });
      if (templateId) {
        query = query.eq('workflow_template_id', templateId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as WorkflowCondition[];
    },
    enabled: !!templateId,
  });
}

export function useCreateWorkflowCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (condition: Partial<WorkflowCondition>) => {
      const { data, error } = await supabase
        .from('workflow_conditions')
        .insert(condition as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-conditions'] });
      toast.success('Bedingung erstellt');
    },
    onError: (error) => {
      console.error('Error creating condition:', error);
      toast.error('Fehler beim Erstellen der Bedingung');
    },
  });
}

export function useDeleteWorkflowCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workflow_conditions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-conditions'] });
      toast.success('Bedingung gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting condition:', error);
      toast.error('Fehler beim Löschen der Bedingung');
    },
  });
}

// ========== ACTIONS ==========

export function useWorkflowActions(templateId?: string) {
  return useQuery({
    queryKey: ['workflow-actions', templateId],
    queryFn: async () => {
      let query = supabase.from('workflow_actions').select('*').order('sort_order', { ascending: true });
      if (templateId) {
        query = query.eq('workflow_template_id', templateId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as WorkflowAction[];
    },
    enabled: !!templateId,
  });
}

export function useCreateWorkflowAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: Partial<WorkflowAction>) => {
      const { data, error } = await supabase
        .from('workflow_actions')
        .insert(action as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-actions'] });
      toast.success('Aktion erstellt');
    },
    onError: (error) => {
      console.error('Error creating action:', error);
      toast.error('Fehler beim Erstellen der Aktion');
    },
  });
}

export function useDeleteWorkflowAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workflow_actions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-actions'] });
      toast.success('Aktion gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting action:', error);
      toast.error('Fehler beim Löschen der Aktion');
    },
  });
}

// ========== APPROVER RULES ==========

export function useWorkflowApproverRules(templateId?: string) {
  return useQuery({
    queryKey: ['workflow-approver-rules', templateId],
    queryFn: async () => {
      let query = supabase.from('workflow_approver_rules').select('*').order('step_number', { ascending: true });
      if (templateId) {
        query = query.eq('workflow_template_id', templateId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as WorkflowApproverRule[];
    },
    enabled: !!templateId,
  });
}

export function useCreateWorkflowApproverRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Partial<WorkflowApproverRule>) => {
      const { data, error } = await supabase
        .from('workflow_approver_rules')
        .insert(rule as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-approver-rules'] });
      toast.success('Genehmiger-Regel erstellt');
    },
    onError: (error) => {
      console.error('Error creating approver rule:', error);
      toast.error('Fehler beim Erstellen der Regel');
    },
  });
}

export function useDeleteWorkflowApproverRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workflow_approver_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-approver-rules'] });
      toast.success('Regel gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting rule:', error);
      toast.error('Fehler beim Löschen der Regel');
    },
  });
}

// ========== PERMISSIONS ==========

export function useWorkflowPermissions(companyId?: string) {
  return useQuery({
    queryKey: ['workflow-permissions', companyId],
    queryFn: async () => {
      let query = supabase.from('workflow_permissions').select('*');
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as WorkflowPermission[];
    },
  });
}

export function useUpsertWorkflowPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permission: Partial<WorkflowPermission>) => {
      const { data, error } = await supabase
        .from('workflow_permissions')
        .upsert(permission as any, { onConflict: 'company_id,role_type' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-permissions'] });
      toast.success('Berechtigung gespeichert');
    },
    onError: (error) => {
      console.error('Error saving permission:', error);
      toast.error('Fehler beim Speichern der Berechtigung');
    },
  });
}
