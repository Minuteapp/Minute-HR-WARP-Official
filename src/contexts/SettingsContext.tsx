// Settings-Driven Architecture (SDA) - React Context
// Stellt effektive Einstellungen für alle Komponenten bereit

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { settingsResolver } from '@/services/settingsResolverService';
import { 
  EffectiveSettings, 
  SettingsContext as SettingsContextType,
  PermissionCheckResult,
  EffectiveSetting 
} from '@/types/settings-driven';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsProviderState {
  // Geladene Einstellungen pro Modul
  moduleSettings: Record<string, EffectiveSettings>;
  // Lade-Status pro Modul
  loadingModules: Set<string>;
  // Fehler pro Modul
  errors: Record<string, string>;
  // Benutzerkontext für Auflösung
  userContext: SettingsContextType | null;
}

interface SettingsContextValue extends SettingsProviderState {
  // Lädt Einstellungen für ein Modul
  loadModuleSettings: (module: string) => Promise<EffectiveSettings>;
  // Holt eine einzelne Einstellung
  getSetting: (module: string, key: string) => EffectiveSetting | null;
  // Holt den Wert einer Einstellung
  getSettingValue: <T = any>(module: string, key: string, defaultValue?: T) => T;
  // Prüft ob eine Aktion erlaubt ist
  isAllowed: (module: string, key: string) => boolean;
  // Detaillierte Berechtigungsprüfung
  checkPermission: (module: string, key: string) => Promise<PermissionCheckResult>;
  // Invalidiert Cache und lädt neu
  refreshSettings: (module?: string) => Promise<void>;
  // Prüft ob ein Modul geladen wird
  isLoading: (module: string) => boolean;
  // Speichert eine einzelne Einstellung
  saveSetting: (module: string, key: string, value: any) => Promise<boolean>;
  // Speichert mehrere Einstellungen
  saveModuleSettings: (module: string, settings: Record<string, any>) => Promise<boolean>;
  // Speicher-Status
  isSaving: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  const [state, setState] = useState<SettingsProviderState>({
    moduleSettings: {},
    loadingModules: new Set(),
    errors: {},
    userContext: null
  });
  const [isSaving, setIsSaving] = useState(false);

  // Erstelle Benutzerkontext wenn Auth verfügbar
  useEffect(() => {
    if (user) {
      const userContext: SettingsContextType = {
        userId: user.id,
        roleId: undefined, // Role-Namen wie "superadmin" sind keine UUIDs - nicht als roleId verwenden
        teamId: undefined, // Später aus Profil laden
        departmentId: undefined,
        locationId: undefined,
        companyId: user.company_id || undefined
      };
      
      setState(prev => ({ ...prev, userContext }));
    }
  }, [user]);

  /**
   * Lädt Einstellungen für ein Modul
   */
  const loadModuleSettings = useCallback(async (module: string): Promise<EffectiveSettings> => {
    // Wenn bereits geladen, aus Cache zurückgeben
    if (state.moduleSettings[module]) {
      return state.moduleSettings[module];
    }

    // Wenn kein Benutzerkontext, leere Settings zurückgeben
    if (!state.userContext) {
      console.warn('[SDA] Kein Benutzerkontext verfügbar');
      return {};
    }

    // Lade-Status setzen
    setState(prev => ({
      ...prev,
      loadingModules: new Set([...prev.loadingModules, module])
    }));

    try {
      const settings = await settingsResolver.getEffectiveSettings(module, state.userContext);
      
      setState(prev => ({
        ...prev,
        moduleSettings: { ...prev.moduleSettings, [module]: settings },
        loadingModules: new Set([...prev.loadingModules].filter(m => m !== module)),
        errors: { ...prev.errors, [module]: '' }
      }));
      
      return settings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      
      setState(prev => ({
        ...prev,
        loadingModules: new Set([...prev.loadingModules].filter(m => m !== module)),
        errors: { ...prev.errors, [module]: errorMessage }
      }));
      
      console.error(`[SDA] Fehler beim Laden der Einstellungen für ${module}:`, error);
      return {};
    }
  }, [state.userContext, state.moduleSettings]);

  /**
   * Holt eine einzelne Einstellung
   */
  const getSetting = useCallback((module: string, key: string): EffectiveSetting | null => {
    const moduleSettings = state.moduleSettings[module];
    if (!moduleSettings) {
      console.warn(`[SDA] Modul '${module}' nicht geladen. Bitte erst loadModuleSettings aufrufen.`);
      return null;
    }
    return moduleSettings[key] || null;
  }, [state.moduleSettings]);

  /**
   * Holt den Wert einer Einstellung
   */
  const getSettingValue = useCallback(<T = any>(
    module: string, 
    key: string, 
    defaultValue?: T
  ): T => {
    const setting = getSetting(module, key);
    if (!setting) {
      return defaultValue as T;
    }
    return setting.value as T;
  }, [getSetting]);

  /**
   * Prüft ob eine Aktion erlaubt ist (synchron, aus Cache)
   */
  const isAllowed = useCallback((module: string, key: string): boolean => {
    const setting = getSetting(module, key);
    if (!setting) {
      // Wenn Setting nicht gefunden, konservativ: nicht erlaubt
      console.warn(`[SDA] Einstellung '${key}' im Modul '${module}' nicht gefunden. Aktion wird blockiert.`);
      return false;
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
      default:
        return !!value;
    }
  }, [getSetting]);

  /**
   * Detaillierte Berechtigungsprüfung (async, lädt bei Bedarf)
   */
  const checkPermission = useCallback(async (
    module: string, 
    key: string
  ): Promise<PermissionCheckResult> => {
    if (!state.userContext) {
      return {
        allowed: false,
        reason: 'Kein Benutzerkontext verfügbar',
        settingKey: key,
        settingValue: undefined,
        source: { level: 'global' }
      };
    }
    
    // Stelle sicher, dass das Modul geladen ist
    if (!state.moduleSettings[module]) {
      await loadModuleSettings(module);
    }
    
    return settingsResolver.checkPermission(module, key, state.userContext);
  }, [state.userContext, state.moduleSettings, loadModuleSettings]);

  /**
   * Invalidiert Cache und lädt neu
   */
  const refreshSettings = useCallback(async (module?: string): Promise<void> => {
    settingsResolver.invalidateCache();
    
    if (module) {
      // Nur ein Modul neu laden
      setState(prev => ({
        ...prev,
        moduleSettings: { ...prev.moduleSettings, [module]: undefined as any }
      }));
      await loadModuleSettings(module);
    } else {
      // Alle Module neu laden
      const modules = Object.keys(state.moduleSettings);
      setState(prev => ({
        ...prev,
        moduleSettings: {}
      }));
      
      await Promise.all(modules.map(m => loadModuleSettings(m)));
    }
  }, [state.moduleSettings, loadModuleSettings]);

  /**
   * Prüft ob ein Modul geladen wird
   */
  const isLoading = useCallback((module: string): boolean => {
    return state.loadingModules.has(module);
  }, [state.loadingModules]);

  /**
   * Speichert eine einzelne Einstellung
   */
  const saveSetting = useCallback(async (
    module: string,
    key: string,
    value: any
  ): Promise<boolean> => {
    if (!state.userContext) {
      console.error('[SDA] Kein Benutzerkontext verfügbar');
      return false;
    }

    setIsSaving(true);
    try {
      const result = await settingsResolver.saveSetting(
        module,
        key,
        value,
        'company',
        state.userContext
      );

      if (result.success) {
        // Nach dem Speichern neu laden
        await refreshSettings(module);
      }

      return result.success;
    } finally {
      setIsSaving(false);
    }
  }, [state.userContext]);

  /**
   * Speichert mehrere Einstellungen auf einmal
   */
  const saveModuleSettingsFunc = useCallback(async (
    module: string,
    settings: Record<string, any>
  ): Promise<boolean> => {
    if (!state.userContext) {
      console.error('[SDA] Kein Benutzerkontext verfügbar');
      return false;
    }

    setIsSaving(true);
    try {
      const success = await settingsResolver.saveModuleSettings(
        module,
        settings,
        'company',
        state.userContext
      );

      if (success) {
        // Nach dem Speichern neu laden
        await refreshSettings(module);
      }

      return success;
    } finally {
      setIsSaving(false);
    }
  }, [state.userContext]);

  const value: SettingsContextValue = {
    ...state,
    loadModuleSettings,
    getSetting,
    getSettingValue,
    isAllowed,
    checkPermission,
    refreshSettings,
    isLoading,
    saveSetting,
    saveModuleSettings: saveModuleSettingsFunc,
    isSaving
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * Hook für Zugriff auf den Settings-Context
 */
export const useSettingsContext = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext muss innerhalb eines SettingsProviders verwendet werden');
  }
  return context;
};

export default SettingsContext;
