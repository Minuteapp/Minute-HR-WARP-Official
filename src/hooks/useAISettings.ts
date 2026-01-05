import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AIGlobalSettings {
  ai_enabled: boolean;
  default_model: string;
  monthly_token_limit: number;
  current_month_usage: number;
  anonymize_data: boolean;
  audit_all_queries: boolean;
  cost_tracking_enabled: boolean;
  openrouter_api_key?: string;
}

export interface AIRoleSettings {
  role: string;
  role_name: string;
  ai_summaries_enabled: boolean;
  ai_recommendations_enabled: boolean;
  ai_forecasts_enabled: boolean;
  natural_language_queries: boolean;
  explainability_required: boolean;
  max_tokens_per_query: number;
}

export interface AllowedDataSources {
  sources: string[];
}

const DEFAULT_GLOBAL_SETTINGS: AIGlobalSettings = {
  ai_enabled: true,
  default_model: 'gpt-4o-mini',
  monthly_token_limit: 100000,
  current_month_usage: 0,
  anonymize_data: true,
  audit_all_queries: true,
  cost_tracking_enabled: true,
};

const DEFAULT_ROLE_SETTINGS: AIRoleSettings[] = [
  { role: 'employee', role_name: 'Mitarbeiter', ai_summaries_enabled: true, ai_recommendations_enabled: false, ai_forecasts_enabled: false, natural_language_queries: false, explainability_required: true, max_tokens_per_query: 500 },
  { role: 'team_lead', role_name: 'Teamleiter', ai_summaries_enabled: true, ai_recommendations_enabled: true, ai_forecasts_enabled: true, natural_language_queries: false, explainability_required: true, max_tokens_per_query: 1000 },
  { role: 'hr_manager', role_name: 'HR-Manager', ai_summaries_enabled: true, ai_recommendations_enabled: true, ai_forecasts_enabled: true, natural_language_queries: true, explainability_required: true, max_tokens_per_query: 2000 },
  { role: 'admin', role_name: 'Administrator', ai_summaries_enabled: true, ai_recommendations_enabled: true, ai_forecasts_enabled: true, natural_language_queries: true, explainability_required: false, max_tokens_per_query: 5000 },
  { role: 'superadmin', role_name: 'Superadmin', ai_summaries_enabled: true, ai_recommendations_enabled: true, ai_forecasts_enabled: true, natural_language_queries: true, explainability_required: false, max_tokens_per_query: 10000 },
];

export const useAISettings = () => {
  const { user } = useAuth();
  const [globalSettings, setGlobalSettings] = useState<AIGlobalSettings>(DEFAULT_GLOBAL_SETTINGS);
  const [roleSettings, setRoleSettings] = useState<AIRoleSettings[]>(DEFAULT_ROLE_SETTINGS);
  const [allowedSources, setAllowedSources] = useState<string[]>([
    'employees', 'absences', 'time_tracking', 'documents', 'projects', 'tickets'
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const companyId = user?.company_id;

  // Einstellungen laden
  const loadSettings = useCallback(async () => {
    if (!companyId) return;

    setIsLoading(true);
    try {
      // Globale Einstellungen aus ai_gateway_config laden
      const { data: gatewayConfig } = await supabase
        .from('ai_gateway_config')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (gatewayConfig) {
        setGlobalSettings({
          ai_enabled: gatewayConfig.ai_mode !== 'disabled',
          default_model: gatewayConfig.default_model || 'gpt-4o-mini',
          monthly_token_limit: (gatewayConfig.monthly_budget_cents || 10000) * 10, // Cents zu Tokens approximiert
          current_month_usage: gatewayConfig.current_month_usage_cents || 0,
          anonymize_data: gatewayConfig.allow_data_storage === false,
          audit_all_queries: true,
          cost_tracking_enabled: true,
          openrouter_api_key: gatewayConfig.openrouter_api_key || undefined,
        });

        // Erlaubte Module als Data Sources
        if (gatewayConfig.enabled_modules) {
          setAllowedSources(gatewayConfig.enabled_modules);
        }
      }

      // Rollenbasierte Einstellungen aus dashboard_ai_settings laden
      const { data: dashboardSettings } = await supabase
        .from('dashboard_ai_settings')
        .select('*')
        .eq('company_id', companyId);

      if (dashboardSettings && dashboardSettings.length > 0) {
        const mappedSettings = DEFAULT_ROLE_SETTINGS.map(defaultSetting => {
          const dbSetting = dashboardSettings.find((s: any) => s.role === defaultSetting.role);
          if (dbSetting) {
            return {
              ...defaultSetting,
              ai_summaries_enabled: dbSetting.ai_summaries_enabled ?? defaultSetting.ai_summaries_enabled,
              ai_recommendations_enabled: dbSetting.ai_recommendations_enabled ?? defaultSetting.ai_recommendations_enabled,
              ai_forecasts_enabled: dbSetting.ai_forecasts_enabled ?? defaultSetting.ai_forecasts_enabled,
              natural_language_queries: dbSetting.natural_language_queries ?? defaultSetting.natural_language_queries,
              explainability_required: dbSetting.explainability_required ?? defaultSetting.explainability_required,
              max_tokens_per_query: dbSetting.max_tokens_per_query ?? defaultSetting.max_tokens_per_query,
            };
          }
          return defaultSetting;
        });
        setRoleSettings(mappedSettings);
      }

    } catch (error) {
      console.error('Fehler beim Laden der KI-Einstellungen:', error);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Einstellungen speichern
  const saveSettings = async () => {
    if (!companyId) {
      toast.error('Keine Firma ausgewählt');
      return false;
    }

    setIsSaving(true);
    try {
      // Globale Einstellungen in ai_gateway_config speichern (Upsert)
      const { error: gatewayError } = await supabase
        .from('ai_gateway_config')
        .upsert({
          company_id: companyId,
          ai_mode: globalSettings.ai_enabled ? 'active' : 'disabled',
          default_model: globalSettings.default_model,
          monthly_budget_cents: Math.round(globalSettings.monthly_token_limit / 10),
          allow_data_storage: !globalSettings.anonymize_data,
          enabled_modules: allowedSources,
          max_tokens_per_request: Math.max(...roleSettings.map(r => r.max_tokens_per_query)),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'company_id' });

      if (gatewayError) {
        console.error('Fehler beim Speichern der Gateway-Config:', gatewayError);
        throw gatewayError;
      }

      // Rollenbasierte Einstellungen in dashboard_ai_settings speichern
      for (const roleSetting of roleSettings) {
        const { error: roleError } = await supabase
          .from('dashboard_ai_settings')
          .upsert({
            company_id: companyId,
            role: roleSetting.role,
            ai_summaries_enabled: roleSetting.ai_summaries_enabled,
            ai_recommendations_enabled: roleSetting.ai_recommendations_enabled,
            ai_forecasts_enabled: roleSetting.ai_forecasts_enabled,
            natural_language_queries: roleSetting.natural_language_queries,
            explainability_required: roleSetting.explainability_required,
            max_tokens_per_query: roleSetting.max_tokens_per_query,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'company_id,role' });

        if (roleError) {
          console.error('Fehler beim Speichern der Rollen-Einstellungen:', roleError);
        }
      }

      toast.success('KI-Einstellungen erfolgreich gespeichert');
      return true;

    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast.error('Fehler beim Speichern der KI-Einstellungen');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Prüfen ob KI für aktuelle Rolle aktiviert
  const isAIEnabledForRole = useCallback((feature: 'summaries' | 'recommendations' | 'forecasts' | 'nlq') => {
    if (!globalSettings.ai_enabled) return false;
    
    const currentRole = user?.role || 'employee';
    const roleSetting = roleSettings.find(r => r.role === currentRole);
    
    if (!roleSetting) return false;

    switch (feature) {
      case 'summaries': return roleSetting.ai_summaries_enabled;
      case 'recommendations': return roleSetting.ai_recommendations_enabled;
      case 'forecasts': return roleSetting.ai_forecasts_enabled;
      case 'nlq': return roleSetting.natural_language_queries;
      default: return false;
    }
  }, [globalSettings.ai_enabled, roleSettings, user?.role]);

  // Prüfen ob Datenquelle erlaubt
  const isDataSourceAllowed = useCallback((source: string) => {
    return allowedSources.includes(source);
  }, [allowedSources]);

  return {
    globalSettings,
    setGlobalSettings,
    roleSettings,
    setRoleSettings,
    allowedSources,
    setAllowedSources,
    isLoading,
    isSaving,
    saveSettings,
    loadSettings,
    isAIEnabledForRole,
    isDataSourceAllowed,
  };
};
