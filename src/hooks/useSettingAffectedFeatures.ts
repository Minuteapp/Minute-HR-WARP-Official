// useSettingAffectedFeatures - Hook zum Laden der affected_features aus settings_definitions
// Implementiert Regel 4 der Settings-Driven Architecture

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AffectedFeature {
  name: string;
  type: 'ui' | 'api' | 'automation' | 'ai' | 'report' | 'workflow';
}

export interface SettingDefinitionInfo {
  key: string;
  name: string;
  description: string;
  category: string;
  affectedFeatures: string[];
  enforcement: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  legalReference?: string;
  auditRequired: boolean;
}

interface UseSettingAffectedFeaturesReturn {
  // Alle Definitionen für das Modul
  definitions: SettingDefinitionInfo[];
  // Definition für einen bestimmten Key
  getDefinition: (key: string) => SettingDefinitionInfo | null;
  // Alle affected_features für einen Key
  getAffectedFeatures: (key: string) => string[];
  // Alle enforcement channels für einen Key
  getEnforcement: (key: string) => string[];
  // Risk level für einen Key
  getRiskLevel: (key: string) => 'low' | 'medium' | 'high' | 'critical';
  // Lade-Status
  loading: boolean;
  // Fehler
  error: string | null;
  // Gruppiert nach Kategorie
  definitionsByCategory: Record<string, SettingDefinitionInfo[]>;
  // Anzahl kritischer Einstellungen
  criticalCount: number;
  // Anzahl high-risk Einstellungen
  highRiskCount: number;
}

/**
 * Hook zum Laden der affected_features und enforcement-Daten aus settings_definitions
 * 
 * Verwendung:
 * ```tsx
 * const { getAffectedFeatures, getEnforcement, getRiskLevel } = useSettingAffectedFeatures('absence');
 * 
 * // Für eine bestimmte Einstellung
 * const features = getAffectedFeatures('self_request_allowed');
 * // => ["Abwesenheitsantrag", "Mobile App", "Manager-Dashboard"]
 * ```
 */
export const useSettingAffectedFeatures = (module: string): UseSettingAffectedFeaturesReturn => {
  const [definitions, setDefinitions] = useState<SettingDefinitionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDefinitions = async () => {
      if (!module) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('settings_definitions')
          .select('key, name, description, category, affected_features, enforcement, risk_level, legal_reference, audit_required')
          .eq('module', module)
          .eq('is_active', true)
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        if (mounted && data) {
          const mappedDefinitions: SettingDefinitionInfo[] = data.map(row => ({
            key: row.key,
            name: row.name,
            description: row.description || '',
            category: row.category || 'general',
            affectedFeatures: Array.isArray(row.affected_features) ? row.affected_features : [],
            enforcement: Array.isArray(row.enforcement) ? row.enforcement : ['ui'],
            riskLevel: (row.risk_level as 'low' | 'medium' | 'high' | 'critical') || 'low',
            legalReference: row.legal_reference || undefined,
            auditRequired: row.audit_required || false,
          }));
          setDefinitions(mappedDefinitions);
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Definitionen';
          setError(errorMessage);
          console.error('[useSettingAffectedFeatures] Error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDefinitions();

    return () => {
      mounted = false;
    };
  }, [module]);

  /**
   * Holt die Definition für einen bestimmten Key
   */
  const getDefinition = useCallback((key: string): SettingDefinitionInfo | null => {
    return definitions.find(d => d.key === key) || null;
  }, [definitions]);

  /**
   * Holt alle affected_features für einen Key
   */
  const getAffectedFeatures = useCallback((key: string): string[] => {
    const def = getDefinition(key);
    return def?.affectedFeatures || [];
  }, [getDefinition]);

  /**
   * Holt alle enforcement channels für einen Key
   */
  const getEnforcement = useCallback((key: string): string[] => {
    const def = getDefinition(key);
    return def?.enforcement || ['ui'];
  }, [getDefinition]);

  /**
   * Holt das Risk Level für einen Key
   */
  const getRiskLevel = useCallback((key: string): 'low' | 'medium' | 'high' | 'critical' => {
    const def = getDefinition(key);
    return def?.riskLevel || 'low';
  }, [getDefinition]);

  /**
   * Gruppiert Definitionen nach Kategorie
   */
  const definitionsByCategory = useMemo(() => {
    return definitions.reduce((acc, def) => {
      const category = def.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(def);
      return acc;
    }, {} as Record<string, SettingDefinitionInfo[]>);
  }, [definitions]);

  /**
   * Anzahl kritischer Einstellungen
   */
  const criticalCount = useMemo(() => {
    return definitions.filter(d => d.riskLevel === 'critical').length;
  }, [definitions]);

  /**
   * Anzahl high-risk Einstellungen
   */
  const highRiskCount = useMemo(() => {
    return definitions.filter(d => d.riskLevel === 'high').length;
  }, [definitions]);

  return {
    definitions,
    getDefinition,
    getAffectedFeatures,
    getEnforcement,
    getRiskLevel,
    loading,
    error,
    definitionsByCategory,
    criticalCount,
    highRiskCount,
  };
};

export default useSettingAffectedFeatures;
