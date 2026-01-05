import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemPolicy {
  id: string;
  policy_key: string;
  policy_category: 'security' | 'timetracking' | 'absence' | 'documents' | 'general';
  policy_name: string;
  policy_description?: string;
  is_active: boolean;
  policy_value: Record<string, any>;
  affected_modules: string[];
  required_roles: string[];
  priority: number;
  effective_from?: string;
  effective_until?: string;
  created_by?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PolicyConflict {
  id: string;
  conflict_type: 'contradiction' | 'incompatible' | 'circular';
  primary_policy_id: string;
  conflicting_policy_id: string;
  conflict_description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_resolved: boolean;
}

export interface PolicyEnforcementResult {
  allowed: boolean;
  policies_applied: { policy_key: string; policy_name: string }[];
  blocked_by?: { policy: string; reason: string }[];
}

export const usePolicyEngine = () => {
  const [policies, setPolicies] = useState<SystemPolicy[]>([]);
  const [conflicts, setConflicts] = useState<PolicyConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Lade alle aktiven Policies
  const loadPolicies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('system_policies')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error loading policies:', error);
      toast({
        title: "Fehler beim Laden der Policies",
        description: "Policies konnten nicht geladen werden.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Lade Policy-Konflikte
  const loadConflicts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('policy_conflicts')
        .select('*')
        .eq('is_resolved', false);

      if (error) throw error;
      setConflicts(data || []);
    } catch (error) {
      console.error('Error loading conflicts:', error);
    }
  }, []);

  // Erstelle neue Policy
  const createPolicy = useCallback(async (policyData: Omit<SystemPolicy, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('system_policies')
        .insert(policyData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Policy erstellt",
        description: `Policy "${policyData.policy_name}" wurde erfolgreich erstellt.`,
      });

      await loadPolicies();
      await loadConflicts(); // Prüfe auf neue Konflikte

      return data;
    } catch (error) {
      console.error('Error creating policy:', error);
      toast({
        title: "Fehler beim Erstellen der Policy",
        description: "Policy konnte nicht erstellt werden.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadPolicies, loadConflicts]);

  // Aktualisiere Policy
  const updatePolicy = useCallback(async (id: string, updates: Partial<SystemPolicy>) => {
    try {
      const { error } = await supabase
        .from('system_policies')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Policy aktualisiert",
        description: "Policy wurde erfolgreich aktualisiert.",
      });

      await loadPolicies();
      await loadConflicts();
    } catch (error) {
      console.error('Error updating policy:', error);
      toast({
        title: "Fehler beim Aktualisieren der Policy",
        description: "Policy konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadPolicies, loadConflicts]);

  // Lösche Policy
  const deletePolicy = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('system_policies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Policy gelöscht",
        description: "Policy wurde erfolgreich gelöscht.",
      });

      await loadPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast({
        title: "Fehler beim Löschen der Policy",
        description: "Policy konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadPolicies]);

  // Prüfe Policy-Durchsetzung
  const checkPolicyEnforcement = useCallback(async (
    userId: string,
    moduleName: string,
    action: string,
    context: Record<string, any> = {}
  ): Promise<PolicyEnforcementResult> => {
    try {
      const { data, error } = await supabase.rpc('check_policy_enforcement', {
        p_user_id: userId,
        p_module_name: moduleName,
        p_action: action,
        p_context: context
      });

      if (error) throw error;
      return data as PolicyEnforcementResult;
    } catch (error) {
      console.error('Error checking policy enforcement:', error);
      // Fallback: Erlaube Zugriff bei Fehlern
      return {
        allowed: true,
        policies_applied: []
      };
    }
  }, []);

  // Löse Policy-Konflikt
  const resolveConflict = useCallback(async (conflictId: string, resolutionNotes: string) => {
    try {
      const { error } = await supabase
        .from('policy_conflicts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          // resolved_by wird automatisch über RLS gesetzt
        })
        .eq('id', conflictId);

      if (error) throw error;

      toast({
        title: "Konflikt gelöst",
        description: "Policy-Konflikt wurde erfolgreich gelöst.",
      });

      await loadConflicts();
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast({
        title: "Fehler beim Lösen des Konflikts",
        description: "Konflikt konnte nicht gelöst werden.",
        variant: "destructive",
      });
    }
  }, [toast, loadConflicts]);

  // Echtzeit-Synchronisation für Policy-Updates
  useEffect(() => {
    const channel = supabase
      .channel('policy-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_policies' },
        () => {
          console.log('Policy change detected, reloading...');
          loadPolicies();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'policy_conflicts' },
        () => {
          console.log('Policy conflict change detected, reloading...');
          loadConflicts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadPolicies, loadConflicts]);

  // Initial laden
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([loadPolicies(), loadConflicts()]);
      setLoading(false);
    };

    initialize();
  }, [loadPolicies, loadConflicts]);

  return {
    policies,
    conflicts,
    loading,
    createPolicy,
    updatePolicy,
    deletePolicy,
    checkPolicyEnforcement,
    resolveConflict,
    refetchPolicies: loadPolicies,
    refetchConflicts: loadConflicts
  };
};