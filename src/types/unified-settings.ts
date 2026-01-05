// Unified Settings System Types
// Enforces 5-container structure and governance rules

import { LucideIcon } from 'lucide-react';

// User roles for permission-based visibility
export type SettingsRole = 'employee' | 'team_leader' | 'hr_admin' | 'superadmin';

// Container types - exactly 5 per module (MANDATORY)
export type ContainerType = 
  | 'grundlagen'        // Container 1: Basics
  | 'organisation'      // Container 2: Organization scope
  | 'regeln'            // Container 3: Rules & Logic
  | 'automatisierung'   // Container 4: Automation & AI
  | 'kontrolle';        // Container 5: Control & Governance

// Scope levels for settings applicability
export type SettingsScope = 'global' | 'standort' | 'abteilung' | 'team';

// Scope priority (higher number = higher priority)
export const SCOPE_PRIORITY: Record<SettingsScope, number> = {
  global: 1,
  standort: 2,
  abteilung: 3,
  team: 4
};

// Container visibility by role
export const CONTAINER_VISIBILITY: Record<SettingsRole, ContainerType[]> = {
  employee: ['grundlagen'],                                              // Nur Grundlagen (Profil, Benachrichtigungen)
  team_leader: ['grundlagen', 'organisation'],                          // Containers 1-2
  hr_admin: ['grundlagen', 'organisation', 'regeln', 'automatisierung'], // Containers 1-4
  superadmin: ['grundlagen', 'organisation', 'regeln', 'automatisierung', 'kontrolle'] // All
};

// Container metadata
export interface ContainerMeta {
  type: ContainerType;
  title: string;
  description: string;
  icon: LucideIcon;
  order: number;
}

// Individual setting definition
export interface SettingDefinition {
  id: string;
  key: string;
  label: string;
  description?: string;
  tooltip?: string;
  type: 'switch' | 'select' | 'input' | 'number' | 'multiselect' | 'time' | 'date';
  defaultValue: unknown;
  isAdvanced: boolean;  // Ebene 2 (erweitert) wenn true
  isRecommended?: boolean;
  affectedModules?: string[];  // Abhängigkeiten
  affectedFeatures?: string[];
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    required?: boolean;
    pattern?: string;
  };
  requiresConfirmation?: boolean; // Bei Änderung bestätigen
  scope?: SettingsScope;
}

// Container with settings
export interface SettingsContainer {
  meta: ContainerMeta;
  settings: SettingDefinition[];
  isExpanded?: boolean;
  showAdvanced?: boolean;
}

// Module settings configuration
export interface ModuleSettingsConfig {
  moduleId: string;
  moduleName: string;
  moduleIcon: LucideIcon;
  containers: SettingsContainer[];
}

// Setting change event
export interface SettingChangeEvent {
  settingKey: string;
  oldValue: unknown;
  newValue: unknown;
  affectedModules: string[];
  requiresConfirmation: boolean;
  changedBy: string;
  changedAt: Date;
  scope: SettingsScope;
  scopeId?: string;
}

// Audit log entry
export interface SettingsAuditEntry {
  id: string;
  settingKey: string;
  moduleId: string;
  oldValue: unknown;
  newValue: unknown;
  changedBy: string;
  changedAt: Date;
  reason?: string;
  scope: SettingsScope;
  scopeId?: string;
}

// Container limit constant - MANDATORY
export const MAX_CONTAINERS_PER_PAGE = 5;

// Validate container count
export function validateContainerCount(containers: SettingsContainer[]): boolean {
  if (containers.length > MAX_CONTAINERS_PER_PAGE) {
    console.error(`Settings violation: ${containers.length} containers exceed limit of ${MAX_CONTAINERS_PER_PAGE}`);
    return false;
  }
  return true;
}

// Get visible containers for a role
export function getVisibleContainers(
  containers: SettingsContainer[],
  role: SettingsRole
): SettingsContainer[] {
  const allowedTypes = CONTAINER_VISIBILITY[role];
  return containers.filter(c => allowedTypes.includes(c.meta.type));
}

// Check if setting affects other modules
export function hasModuleDependencies(setting: SettingDefinition): boolean {
  return (setting.affectedModules?.length ?? 0) > 0 || 
         (setting.affectedFeatures?.length ?? 0) > 0;
}
