import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AISettingsContextType {
  isAIEnabled: boolean;
  isLoading: boolean;
  hasPermission: (feature: AIFeature) => boolean;
  getMaxTokens: () => number;
  requiresExplainability: () => boolean;
  refreshSettings: () => Promise<void>;
}

type AIFeature = 
  | 'summaries' 
  | 'recommendations' 
  | 'forecasts' 
  | 'nlq' 
  | 'shift_planning' 
  | 'goal_suggestions'
  | 'employee_insights'
  | 'budget_forecasting'
  | 'applicant_suggestions';

interface AIGatewayConfig {
  ai_mode: string;
  enabled_modules: string[];
  max_tokens_per_request: number;
  require_user_confirmation: boolean;
}

interface RoleAISettings {
  ai_summaries_enabled: boolean;
  ai_recommendations_enabled: boolean;
  ai_forecasts_enabled: boolean;
  natural_language_queries: boolean;
  explainability_required: boolean;
  max_tokens_per_query: number;
}

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

export const AISettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [gatewayConfig, setGatewayConfig] = useState<AIGatewayConfig | null>(null);
  const [roleSettings, setRoleSettings] = useState<RoleAISettings | null>(null);

  const companyId = user?.company_id;
  const userRole = user?.role || 'employee';

  const loadSettings = useCallback(async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      // Gateway-Konfiguration laden
      const { data: gateway } = await supabase
        .from('ai_gateway_config')
        .select('ai_mode, enabled_modules, max_tokens_per_request, require_user_confirmation')
        .eq('company_id', companyId)
        .single();

      if (gateway) {
        setGatewayConfig(gateway);
        setIsAIEnabled(gateway.ai_mode !== 'disabled');
      }

      // Rollenbasierte Einstellungen laden
      const { data: roleSetting } = await supabase
        .from('dashboard_ai_settings')
        .select('*')
        .eq('company_id', companyId)
        .eq('role', userRole)
        .single();

      if (roleSetting) {
        setRoleSettings(roleSetting);
      }

    } catch (error) {
      console.error('Fehler beim Laden der KI-Einstellungen:', error);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, userRole]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const hasPermission = useCallback((feature: AIFeature): boolean => {
    if (!isAIEnabled) return false;
    
    // Prüfe ob Modul global aktiviert
    const moduleMap: Record<AIFeature, string> = {
      summaries: 'summaries',
      recommendations: 'recommendations',
      forecasts: 'forecasts',
      nlq: 'natural_language',
      shift_planning: 'shift_planning',
      goal_suggestions: 'performance',
      employee_insights: 'performance',
      budget_forecasting: 'budget',
      applicant_suggestions: 'recruiting',
    };

    const module = moduleMap[feature];
    if (gatewayConfig?.enabled_modules && !gatewayConfig.enabled_modules.includes(module)) {
      return false;
    }

    // Prüfe rollenbasierte Einstellungen
    if (!roleSettings) {
      // Fallback: Admins haben alle Rechte
      return ['admin', 'superadmin', 'hr_admin'].includes(userRole);
    }

    switch (feature) {
      case 'summaries':
        return roleSettings.ai_summaries_enabled;
      case 'recommendations':
      case 'goal_suggestions':
      case 'applicant_suggestions':
        return roleSettings.ai_recommendations_enabled;
      case 'forecasts':
      case 'budget_forecasting':
        return roleSettings.ai_forecasts_enabled;
      case 'nlq':
        return roleSettings.natural_language_queries;
      case 'shift_planning':
      case 'employee_insights':
        return roleSettings.ai_recommendations_enabled || roleSettings.ai_forecasts_enabled;
      default:
        return false;
    }
  }, [isAIEnabled, gatewayConfig, roleSettings, userRole]);

  const getMaxTokens = useCallback((): number => {
    return roleSettings?.max_tokens_per_query || gatewayConfig?.max_tokens_per_request || 1000;
  }, [roleSettings, gatewayConfig]);

  const requiresExplainability = useCallback((): boolean => {
    return roleSettings?.explainability_required ?? true;
  }, [roleSettings]);

  const value: AISettingsContextType = {
    isAIEnabled,
    isLoading,
    hasPermission,
    getMaxTokens,
    requiresExplainability,
    refreshSettings: loadSettings,
  };

  return (
    <AISettingsContext.Provider value={value}>
      {children}
    </AISettingsContext.Provider>
  );
};

export const useAISettingsContext = () => {
  const context = useContext(AISettingsContext);
  if (context === undefined) {
    throw new Error('useAISettingsContext must be used within an AISettingsProvider');
  }
  return context;
};
