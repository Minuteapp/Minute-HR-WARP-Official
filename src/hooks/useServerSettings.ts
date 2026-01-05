// Settings-Driven Architecture (SDA) - Server-Side Settings Hook
// Nutzt die RPC-Funktionen für serverseitige Settings-Auflösung mit provenance

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EffectiveSettingsResult {
  module: string;
  tenant_id: string;
  settings: Record<string, any>;
  provenance: Record<string, { source: string; value: any }>;
  version_hash: string;
  resolved_at: string;
}

export interface EnforceSettingResult {
  allowed: boolean;
  key: string;
  current_value: any;
  required_value: any;
  source: string;
  blocked_by_setting?: string;
  message: string;
}

/**
 * Hook für serverseitige Settings-Auflösung
 * Nutzt die get_effective_settings RPC-Funktion
 */
export const useServerSettings = (module: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['server-settings', module, user?.company_id],
    queryFn: async (): Promise<EffectiveSettingsResult | null> => {
      if (!user?.company_id) return null;
      
      const { data, error } = await supabase.rpc('get_effective_settings', {
        p_module: module,
        p_tenant_id: user.company_id,
        p_user_id: user.id
      });
      
      if (error) {
        console.error('[SDA] Server-Settings Fehler:', error);
        throw error;
      }
      
      return data as EffectiveSettingsResult;
    },
    enabled: !!user?.company_id && !!module,
    staleTime: 60000, // 1 Minute
    gcTime: 300000 // 5 Minuten
  });
};

/**
 * Hook für Setting-Enforcement
 * Prüft ob eine Aktion durch ein Setting blockiert wird
 */
export const useEnforceSetting = () => {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      module, 
      key, 
      requiredValue = true 
    }: { 
      module: string; 
      key: string; 
      requiredValue?: any 
    }): Promise<EnforceSettingResult> => {
      if (!user?.company_id) {
        return {
          allowed: false,
          key,
          current_value: null,
          required_value: requiredValue,
          source: 'error',
          blocked_by_setting: key,
          message: 'Kein Benutzerkontext verfügbar'
        };
      }
      
      const { data, error } = await supabase.rpc('enforce_setting', {
        p_module: module,
        p_key: key,
        p_tenant_id: user.company_id,
        p_user_id: user.id,
        p_required_value: requiredValue
      });
      
      if (error) {
        console.error('[SDA] Enforce-Setting Fehler:', error);
        throw error;
      }
      
      return data as EnforceSettingResult;
    }
  });
};

/**
 * Hook für Tenant-Settings-Initialisierung
 * Nur für Superadmins
 */
export const useInitializeTenantSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const { data, error } = await supabase.rpc('initialize_tenant_settings', {
        p_tenant_id: tenantId
      });
      
      if (error) {
        console.error('[SDA] Initialize-Settings Fehler:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data, tenantId) => {
      toast.success(`${data.settings_created} Settings initialisiert`);
      queryClient.invalidateQueries({ queryKey: ['server-settings'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
    },
    onError: (error: Error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });
};

/**
 * Hook für Settings-Reset auf 80/20 Defaults
 * Nur für Superadmins
 */
export const useResetTenantSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const { data, error } = await supabase.rpc('reset_tenant_to_8020_defaults', {
        p_tenant_id: tenantId
      });
      
      if (error) {
        console.error('[SDA] Reset-Settings Fehler:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data, tenantId) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['server-settings'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
    },
    onError: (error: Error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });
};

/**
 * Utility Hook: Prüft schnell ob ein Feature erlaubt ist
 */
export const useIsFeatureAllowed = (module: string, key: string): {
  allowed: boolean;
  loading: boolean;
  source: string | null;
} => {
  const { data, isLoading } = useServerSettings(module);
  
  if (isLoading || !data) {
    return { allowed: false, loading: isLoading, source: null };
  }
  
  const value = data.settings[key];
  const prov = data.provenance[key];
  
  // Boolean auswerten
  const allowed = value === true || value === 'true';
  
  return { 
    allowed, 
    loading: false, 
    source: prov?.source || null 
  };
};

/**
 * Utility Hook: Holt einen Setting-Wert mit Provenance
 */
export const useSettingWithProvenance = <T = any>(
  module: string, 
  key: string, 
  defaultValue?: T
): {
  value: T;
  source: string | null;
  loading: boolean;
} => {
  const { data, isLoading } = useServerSettings(module);
  
  if (isLoading || !data) {
    return { 
      value: defaultValue as T, 
      source: null, 
      loading: isLoading 
    };
  }
  
  const value = data.settings[key] ?? defaultValue;
  const prov = data.provenance[key];
  
  return { 
    value: value as T, 
    source: prov?.source || null, 
    loading: false 
  };
};