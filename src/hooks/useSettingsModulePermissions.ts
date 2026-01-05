/**
 * Hook für rollenbasierte Settings-Berechtigungen
 * Filtert Einstellungs-Module basierend auf der effektiven Benutzerrolle
 */

import { useMemo } from 'react';
import { useSidebarPermissions, EffectiveRole } from './useSidebarPermissions';
import { 
  SETTINGS_MODULE_PERMISSIONS, 
  SettingsRole, 
  SettingsScope,
  toSettingsRole 
} from '@/config/settingsPermissions';

interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  modules: SettingsModule[];
}

interface SettingsModule {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
  tags: string[];
  color: string;
}

export interface UseSettingsModulePermissionsReturn {
  /** Prüft ob ein Settings-Modul für die aktuelle Rolle sichtbar ist */
  isSettingVisible: (moduleId: string) => boolean;
  /** Prüft ob ein Settings-Modul bearbeitet werden kann */
  canEditSetting: (moduleId: string) => boolean;
  /** Gibt den Scope für eine Einstellung zurück (own, team, department, global) */
  getSettingsScope: (moduleId: string) => SettingsScope;
  /** Filtert Einstellungs-Kategorien basierend auf der Rolle */
  filterSettingsCategories: (categories: SettingsCategory[]) => SettingsCategory[];
  /** Die effektive Rolle des Benutzers */
  effectiveRole: EffectiveRole | undefined;
  /** Die als SettingsRole konvertierte Rolle */
  settingsRole: SettingsRole;
  /** Ob noch geladen wird */
  loading: boolean;
}

export const useSettingsModulePermissions = (): UseSettingsModulePermissionsReturn => {
  const { effectiveRole, loading } = useSidebarPermissions();
  
  // Konvertiere zu SettingsRole
  const settingsRole = useMemo(() => toSettingsRole(effectiveRole), [effectiveRole]);

  /**
   * Prüft ob ein Settings-Modul sichtbar ist
   */
  const isSettingVisible = (moduleId: string): boolean => {
    // SuperAdmin und Admin sehen immer alles
    if (effectiveRole === 'superadmin' || effectiveRole === 'admin') {
      return true;
    }

    const permission = SETTINGS_MODULE_PERMISSIONS[moduleId];
    if (!permission) {
      // Unbekannte Module: Fallback auf nicht sichtbar für niedrige Rollen
      return effectiveRole === 'hr_admin' || effectiveRole === 'team_lead';
    }

    return permission.visibility[settingsRole] ?? false;
  };

  /**
   * Prüft ob ein Settings-Modul bearbeitet werden kann
   */
  const canEditSetting = (moduleId: string): boolean => {
    // SuperAdmin und Admin können immer bearbeiten
    if (effectiveRole === 'superadmin' || effectiveRole === 'admin') {
      return true;
    }

    const permission = SETTINGS_MODULE_PERMISSIONS[moduleId];
    if (!permission) {
      return false;
    }

    return permission.canEdit[settingsRole] ?? false;
  };

  /**
   * Gibt den Scope für eine Einstellung zurück
   */
  const getSettingsScope = (moduleId: string): SettingsScope => {
    const permission = SETTINGS_MODULE_PERMISSIONS[moduleId];
    if (!permission) {
      return 'own';
    }

    return permission.scope[settingsRole] ?? 'own';
  };

  /**
   * Filtert Einstellungs-Kategorien basierend auf der Rolle
   */
  const filterSettingsCategories = (categories: SettingsCategory[]): SettingsCategory[] => {
    return categories
      .map(category => ({
        ...category,
        modules: category.modules.filter(module => isSettingVisible(module.id))
      }))
      .filter(category => category.modules.length > 0);
  };

  return {
    isSettingVisible,
    canEditSetting,
    getSettingsScope,
    filterSettingsCategories,
    effectiveRole,
    settingsRole,
    loading,
  };
};

/**
 * Hook für einzelne Settings-Seiten
 * Gibt Zugriffs- und Bearbeitungsberechtigungen für ein spezifisches Modul zurück
 */
export const useSettingsPagePermission = (moduleId: string) => {
  const { isSettingVisible, canEditSetting, getSettingsScope, effectiveRole, loading } = useSettingsModulePermissions();

  return {
    canAccess: isSettingVisible(moduleId),
    canEdit: canEditSetting(moduleId),
    scope: getSettingsScope(moduleId),
    isReadOnly: !canEditSetting(moduleId),
    effectiveRole,
    loading,
  };
};
