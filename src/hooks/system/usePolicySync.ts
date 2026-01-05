import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PolicySyncOptions {
  onPolicyChange?: (event: any) => void;
  modules?: string[];
  realTimeUpdates?: boolean;
}

export const usePolicySync = (options: PolicySyncOptions = {}) => {
  const { onPolicyChange, modules = [], realTimeUpdates = true } = options;
  const { toast } = useToast();

  // Handle real-time policy changes
  const handlePolicyChange = useCallback((event: any) => {
    const { event_type, policy_id, affected_modules, change_payload } = event.payload;
    
    console.log('Policy change received:', event_type, policy_id);

    // Check if this change affects the specified modules
    if (modules.length > 0) {
      const isRelevant = affected_modules.some((module: string) => 
        modules.includes(module)
      ) || affected_modules.length === 0;

      if (!isRelevant) {
        return; // Skip non-relevant changes
      }
    }

    // Show user notification for important changes
    if (event_type === 'policy_created' || event_type === 'policy_updated') {
      const policyName = change_payload?.new?.policy_name || change_payload?.policy_name;
      const isActive = change_payload?.new?.is_active ?? change_payload?.is_active;
      
      if (isActive) {
        toast({
          title: "Sicherheitsrichtlinie aktualisiert",
          description: `"${policyName}" ist jetzt aktiv und kann Ihre Arbeit beeinflussen.`,
        });
      }
    }

    // Call custom handler if provided
    if (onPolicyChange) {
      onPolicyChange(event);
    }
  }, [modules, onPolicyChange, toast]);

  // Set up real-time subscription
  useEffect(() => {
    if (!realTimeUpdates) return;

    console.log('Setting up policy sync subscription for modules:', modules);

    const channel = supabase
      .channel('policy-updates')
      .on('broadcast', { event: 'policy_change' }, handlePolicyChange)
      .subscribe();

    return () => {
      console.log('Cleaning up policy sync subscription');
      supabase.removeChannel(channel);
    };
  }, [handlePolicyChange, modules, realTimeUpdates]);

  // Function to trigger policy sync manually
  const triggerPolicySync = useCallback(async (policyId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('policy-sync', {
        body: {
          policy_id: policyId,
          event_type: 'manual_sync',
          affected_modules: modules,
          change_payload: {}
        }
      });

      if (error) throw error;
      
      console.log('Policy sync triggered:', data);
      return data;
    } catch (error) {
      console.error('Error triggering policy sync:', error);
      throw error;
    }
  }, [modules]);

  return {
    triggerPolicySync
  };
};