// Settings-Driven Architecture (SDA) - React Hook
// Einfacher Zugriff auf effektive Einstellungen pro Modul

import { useEffect, useState, useCallback } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { 
  EffectiveSettings, 
  EffectiveSetting,
  PermissionCheckResult 
} from '@/types/settings-driven';

interface UseEffectiveSettingsReturn {
  // Alle Einstellungen des Moduls
  settings: EffectiveSettings;
  // Lade-Status
  loading: boolean;
  // Speicher-Status
  isSaving: boolean;
  // Fehler-Status
  error: string | null;
  // Holt eine einzelne Einstellung
  getSetting: (key: string) => EffectiveSetting | null;
  // Holt den Wert einer Einstellung
  getValue: <T = any>(key: string, defaultValue?: T) => T;
  // Prüft ob eine Aktion erlaubt ist (synchron)
  isAllowed: (key: string) => boolean;
  // Detaillierte Berechtigungsprüfung (async)
  checkPermission: (key: string) => Promise<PermissionCheckResult>;
  // Lädt Einstellungen neu
  refresh: () => Promise<void>;
  // Hilfsfunktion: Erklärt warum etwas nicht erlaubt ist
  getRestrictionReason: (key: string) => string;
  // Speichert eine einzelne Einstellung
  saveSetting: (key: string, value: any) => Promise<boolean>;
  // Speichert mehrere Einstellungen
  saveSettings: (settings: Record<string, any>) => Promise<boolean>;
}

/**
 * Hook für modul-spezifische Settings
 * 
 * Verwendung:
 * ```tsx
 * const { settings, isAllowed, getValue } = useEffectiveSettings('timetracking');
 * 
 * // Prüfen ob Nachbuchung erlaubt ist
 * if (isAllowed('manual_booking_allowed')) {
 *   // Button anzeigen
 * }
 * 
 * // Wert einer Einstellung holen
 * const threshold = getValue('overtime_threshold_hours', 8);
 * ```
 */
export const useEffectiveSettings = (module: string): UseEffectiveSettingsReturn => {
  const context = useSettingsContext();
  const [localSettings, setLocalSettings] = useState<EffectiveSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lade Einstellungen beim Mount und wenn sich das Modul ändert
  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const settings = await context.loadModuleSettings(module);
        if (mounted) {
          setLocalSettings(settings);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
          setError(errorMessage);
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, [module, context.loadModuleSettings]);

  /**
   * Holt eine einzelne Einstellung
   */
  const getSetting = useCallback((key: string): EffectiveSetting | null => {
    return localSettings[key] || null;
  }, [localSettings]);

  /**
   * Holt den Wert einer Einstellung
   */
  const getValue = useCallback(<T = any>(key: string, defaultValue?: T): T => {
    const setting = getSetting(key);
    if (!setting) {
      return defaultValue as T;
    }
    return setting.value as T;
  }, [getSetting]);

  /**
   * Prüft ob eine Aktion erlaubt ist (synchron, aus Cache)
   */
  const isAllowed = useCallback((key: string): boolean => {
    const setting = getSetting(key);
    if (!setting) {
      // Standard: Erlaubt wenn Setting nicht gefunden (benutzerfreundlicher Ansatz)
      // Bestimmte wichtige Funktionen sollten standardmäßig aktiviert sein
      const defaultAllowedSettings = [
        'manual_booking_allowed',
        'time_tracking_enabled',
        'break_tracking_enabled'
      ];
      const shouldDefaultToAllowed = defaultAllowedSettings.includes(key);
      console.warn(`[SDA] Einstellung '${key}' im Modul '${module}' nicht gefunden, Default: ${shouldDefaultToAllowed ? 'erlaubt' : 'nicht erlaubt'}`);
      return shouldDefaultToAllowed;
    }
    
    const { value, definition } = setting;
    
    switch (definition.valueType) {
      case 'boolean':
        return value === true;
      case 'number':
        return value > 0;
      case 'string':
        return value !== '' && value !== 'disabled' && value !== 'none';
      case 'array':
        return Array.isArray(value) && value.length > 0;
      case 'enum':
        return value !== 'disabled' && value !== 'none';
      default:
        return !!value;
    }
  }, [getSetting, module]);

  /**
   * Detaillierte Berechtigungsprüfung (async)
   */
  const checkPermission = useCallback(async (key: string): Promise<PermissionCheckResult> => {
    return context.checkPermission(module, key);
  }, [context, module]);

  /**
   * Lädt Einstellungen neu
   */
  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    await context.refreshSettings(module);
    const settings = await context.loadModuleSettings(module);
    setLocalSettings(settings);
    setLoading(false);
  }, [context, module]);

  /**
   * Erklärt warum etwas nicht erlaubt ist
   */
  const getRestrictionReason = useCallback((key: string): string => {
    const setting = getSetting(key);
    
    if (!setting) {
      return `Die Einstellung '${key}' ist nicht konfiguriert.`;
    }
    
    if (setting.isLocked) {
      const levelName = getScopeLevelName(setting.source.level);
      return `Diese Funktion ist auf Ebene '${levelName}' gesperrt und kann nicht überschrieben werden.`;
    }
    
    if (!isAllowed(key)) {
      const levelName = getScopeLevelName(setting.source.level);
      return `Diese Funktion ist laut Einstellungen auf Ebene '${levelName}' nicht erlaubt.`;
    }
    
    return '';
  }, [getSetting, isAllowed]);

  /**
   * Speichert eine einzelne Einstellung
   */
  const saveSetting = useCallback(async (key: string, value: any): Promise<boolean> => {
    const success = await context.saveSetting(module, key, value);
    return success;
  }, [context, module]);

  /**
   * Speichert mehrere Einstellungen
   */
  const saveSettings = useCallback(async (settings: Record<string, any>): Promise<boolean> => {
    const success = await context.saveModuleSettings(module, settings);
    return success;
  }, [context, module]);

  return {
    settings: localSettings,
    loading,
    isSaving: context.isSaving,
    error,
    getSetting,
    getValue,
    isAllowed,
    checkPermission,
    refresh,
    getRestrictionReason,
    saveSetting,
    saveSettings
  };
};

/**
 * Übersetzt Scope-Level in lesbare Namen
 */
const getScopeLevelName = (level: string): string => {
  const names: Record<string, string> = {
    global: 'Global',
    company: 'Gesellschaft',
    location: 'Standort',
    department: 'Abteilung',
    team: 'Team',
    role: 'Rolle',
    user: 'Benutzer'
  };
  return names[level] || level;
};

/**
 * Hook für schnelle Berechtigungsprüfung
 * 
 * Verwendung:
 * ```tsx
 * const canManualBook = useSettingAllowed('timetracking', 'manual_booking_allowed');
 * ```
 */
export const useSettingAllowed = (module: string, key: string): boolean => {
  const { isAllowed, loading } = useEffectiveSettings(module);
  
  // Während des Ladens: konservativ nicht erlauben
  if (loading) {
    return false;
  }
  
  return isAllowed(key);
};

/**
 * Hook für Einstellungswert
 * 
 * Verwendung:
 * ```tsx
 * const threshold = useSettingValue('timetracking', 'overtime_threshold_hours', 8);
 * ```
 */
export const useSettingValue = <T = any>(
  module: string, 
  key: string, 
  defaultValue?: T
): T => {
  const { getValue, loading } = useEffectiveSettings(module);
  
  if (loading) {
    return defaultValue as T;
  }
  
  return getValue(key, defaultValue);
};

export default useEffectiveSettings;
