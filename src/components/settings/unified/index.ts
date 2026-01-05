// Unified Settings System - Central Exports
export { UnifiedSettingsContainer } from './UnifiedSettingsContainer';
export { SettingsPermissionGuard, useSettingsPermission } from './SettingsPermissionGuard';
export { SettingsImpactDisplay } from './SettingsImpactDisplay';
export { ScopeSelector } from './ScopeSelector';
export { ResetToDefaultButton } from './ResetToDefaultButton';

// Re-export types for convenience
export type {
  SettingsRole,
  SettingsScope,
  ContainerType,
  ContainerMeta,
  SettingDefinition,
  SettingsContainer,
  ModuleSettingsConfig,
  SettingChangeEvent,
  SettingsAuditEntry
} from '@/types/unified-settings';

export {
  SCOPE_PRIORITY,
  CONTAINER_VISIBILITY,
  MAX_CONTAINERS_PER_PAGE,
  validateContainerCount,
  getVisibleContainers,
  hasModuleDependencies
} from '@/types/unified-settings';