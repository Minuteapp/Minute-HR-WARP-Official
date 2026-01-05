import { useState, useCallback, useMemo } from 'react';
import { 
  SettingsContainer, 
  SettingDefinition, 
  SettingsScope,
  SettingsRole,
  SettingChangeEvent,
  getVisibleContainers,
  validateContainerCount,
  hasModuleDependencies
} from '@/types/unified-settings';
import { useToast } from '@/hooks/use-toast';

interface UseUnifiedSettingsProps {
  moduleId: string;
  containers: SettingsContainer[];
  userRole: SettingsRole;
  currentScope: SettingsScope;
  scopeId?: string;
  onSettingChange?: (event: SettingChangeEvent) => Promise<void>;
}

interface SettingValue {
  value: unknown;
  isModified: boolean;
  scope: SettingsScope;
}

export function useUnifiedSettings({
  moduleId,
  containers,
  userRole,
  currentScope,
  scopeId,
  onSettingChange
}: UseUnifiedSettingsProps) {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, SettingValue>>({});
  const [showAdvanced, setShowAdvanced] = useState<Record<string, boolean>>({});
  const [expandedContainers, setExpandedContainers] = useState<Record<string, boolean>>({});
  const [pendingChange, setPendingChange] = useState<SettingChangeEvent | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Validate container count on mount
  useMemo(() => {
    validateContainerCount(containers);
  }, [containers]);

  // Get visible containers based on user role
  const visibleContainers = useMemo(() => {
    return getVisibleContainers(containers, userRole);
  }, [containers, userRole]);

  // Get standard (non-advanced) settings for a container
  const getStandardSettings = useCallback((container: SettingsContainer): SettingDefinition[] => {
    return container.settings.filter(s => !s.isAdvanced);
  }, []);

  // Get advanced settings for a container
  const getAdvancedSettings = useCallback((container: SettingsContainer): SettingDefinition[] => {
    return container.settings.filter(s => s.isAdvanced);
  }, []);

  // Toggle advanced settings visibility for a container
  const toggleAdvanced = useCallback((containerType: string) => {
    setShowAdvanced(prev => ({
      ...prev,
      [containerType]: !prev[containerType]
    }));
  }, []);

  // Toggle container expansion
  const toggleContainer = useCallback((containerType: string) => {
    setExpandedContainers(prev => ({
      ...prev,
      [containerType]: !prev[containerType]
    }));
  }, []);

  // Get current value for a setting
  const getValue = useCallback((settingKey: string, defaultValue: unknown): unknown => {
    return values[settingKey]?.value ?? defaultValue;
  }, [values]);

  // Handle setting change
  const handleChange = useCallback(async (
    setting: SettingDefinition,
    newValue: unknown
  ) => {
    const oldValue = getValue(setting.key, setting.defaultValue);
    
    const changeEvent: SettingChangeEvent = {
      settingKey: setting.key,
      oldValue,
      newValue,
      affectedModules: setting.affectedModules ?? [],
      requiresConfirmation: setting.requiresConfirmation ?? hasModuleDependencies(setting),
      changedBy: 'current-user', // Will be replaced with actual user
      changedAt: new Date(),
      scope: currentScope,
      scopeId
    };

    // If change requires confirmation and affects other modules
    if (changeEvent.requiresConfirmation && changeEvent.affectedModules.length > 0) {
      setPendingChange(changeEvent);
      setIsConfirmDialogOpen(true);
      return;
    }

    // Apply change directly
    await applyChange(changeEvent);
  }, [getValue, currentScope, scopeId]);

  // Apply a setting change
  const applyChange = useCallback(async (changeEvent: SettingChangeEvent) => {
    try {
      // Update local state
      setValues(prev => ({
        ...prev,
        [changeEvent.settingKey]: {
          value: changeEvent.newValue,
          isModified: true,
          scope: changeEvent.scope
        }
      }));

      // Call external handler if provided
      if (onSettingChange) {
        await onSettingChange(changeEvent);
      }

      toast({
        title: "Einstellung gespeichert",
        description: "Die Änderung wurde erfolgreich übernommen."
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Einstellung konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  }, [onSettingChange, toast]);

  // Confirm pending change
  const confirmPendingChange = useCallback(async () => {
    if (pendingChange) {
      await applyChange(pendingChange);
      setPendingChange(null);
      setIsConfirmDialogOpen(false);
    }
  }, [pendingChange, applyChange]);

  // Cancel pending change
  const cancelPendingChange = useCallback(() => {
    setPendingChange(null);
    setIsConfirmDialogOpen(false);
  }, []);

  // Reset a container to defaults
  const resetContainer = useCallback((container: SettingsContainer) => {
    const newValues = { ...values };
    container.settings.forEach(setting => {
      delete newValues[setting.key];
    });
    setValues(newValues);
    
    toast({
      title: "Zurückgesetzt",
      description: `${container.meta.title} wurde auf Standard zurückgesetzt.`
    });
  }, [values, toast]);

  // Reset a single setting to default
  const resetSetting = useCallback((setting: SettingDefinition) => {
    setValues(prev => {
      const newValues = { ...prev };
      delete newValues[setting.key];
      return newValues;
    });
  }, []);

  // Check if a setting is modified
  const isModified = useCallback((settingKey: string): boolean => {
    return values[settingKey]?.isModified ?? false;
  }, [values]);

  // Get all modified settings
  const getModifiedSettings = useCallback((): string[] => {
    return Object.entries(values)
      .filter(([_, v]) => v.isModified)
      .map(([key]) => key);
  }, [values]);

  return {
    visibleContainers,
    showAdvanced,
    expandedContainers,
    pendingChange,
    isConfirmDialogOpen,
    getStandardSettings,
    getAdvancedSettings,
    toggleAdvanced,
    toggleContainer,
    getValue,
    handleChange,
    confirmPendingChange,
    cancelPendingChange,
    resetContainer,
    resetSetting,
    isModified,
    getModifiedSettings
  };
}
