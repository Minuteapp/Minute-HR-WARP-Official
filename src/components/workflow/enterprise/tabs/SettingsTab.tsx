import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SettingsHeader } from '../settings/SettingsHeader';
import { SettingsSubTabs } from '../settings/SettingsSubTabs';
import { PermissionsSettings } from '../settings/PermissionsSettings';
import { SecuritySettings } from '../settings/SecuritySettings';
import { AISettings } from '../settings/AISettings';
import { IntegrationsSettings } from '../settings/IntegrationsSettings';
import { PerformanceSettings } from '../settings/PerformanceSettings';
import { PrivacySettings } from '../settings/PrivacySettings';
import { useToast } from '@/hooks/use-toast';

const defaultSettings = {
  permissions: { create: ['admin', 'hr_manager'], edit: ['admin', 'hr_manager', 'team_lead'], delete: ['admin'], execute: ['admin', 'hr_manager', 'team_lead', 'employee'], view_logs: ['admin', 'hr_manager', 'team_lead'], export_logs: ['admin', 'hr_manager'] },
  visibility_own_only: false,
  visibility_team: true,
  visibility_all: false,
  require_approval_before_activation: true,
  require_approval_on_change: false,
  four_eyes_principle: true,
  versioning_enabled: true,
  audit_modules: ['absence', 'sick_leave', 'time_tracking', 'payroll', 'recruiting', 'onboarding', 'performance', 'expenses', 'projects', 'documents', 'compliance'],
  ai_generation_enabled: true,
  ai_explanations_enabled: true,
  ai_optimization_enabled: true,
  ai_translation_enabled: false,
  ai_auto_decisions: false,
  ai_confidence_threshold: 85,
  ai_logging_enabled: true,
  ai_data_retention_days: 90,
  sevdesk_enabled: false, sevdesk_api_key: '', sevdesk_tenant_id: '',
  datev_enabled: false, datev_api_key: '', datev_tenant_id: '',
  slack_enabled: false, slack_api_key: '', slack_tenant_id: '',
  ms_teams_enabled: false,
  webhooks_enabled: true,
  max_parallel_workflows: 50,
  max_workflow_duration_seconds: 300,
  retry_strategy: 'exponential',
  max_retries: 3,
  notify_on_error: true,
  gdpr_compliant: true,
  pii_masking_enabled: true,
  log_encryption_enabled: true,
  log_retention_days: 365,
  log_access_roles: ['admin', 'revisor'],
};

export const SettingsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('permissions');
  const [settings, setSettings] = useState<any>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: savedSettings } = useQuery({
    queryKey: ['workflow-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('workflow_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...savedSettings });
    }
  }, [savedSettings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { id, created_at, updated_at, ...settingsToSave } = settings;
      if (savedSettings?.id) {
        const { error } = await supabase.from('workflow_settings').update(settingsToSave).eq('id', savedSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('workflow_settings').insert([settingsToSave]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-settings'] });
      setHasChanges(false);
      toast({ title: "Gespeichert", description: "Einstellungen wurden gespeichert." });
    },
    onError: () => {
      toast({ title: "Fehler", description: "Einstellungen konnten nicht gespeichert werden.", variant: "destructive" });
    },
  });

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updatePermission = (action: string, roles: string[]) => {
    setSettings((prev: any) => ({ ...prev, permissions: { ...prev.permissions, [action]: roles } }));
    setHasChanges(true);
  };

  const toggleAuditModule = (module: string) => {
    setSettings((prev: any) => ({
      ...prev,
      audit_modules: prev.audit_modules.includes(module)
        ? prev.audit_modules.filter((m: string) => m !== module)
        : [...prev.audit_modules, module]
    }));
    setHasChanges(true);
  };

  const toggleLogAccessRole = (role: string) => {
    setSettings((prev: any) => ({
      ...prev,
      log_access_roles: prev.log_access_roles.includes(role)
        ? prev.log_access_roles.filter((r: string) => r !== role)
        : [...prev.log_access_roles, role]
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <SettingsHeader isSaving={saveMutation.isPending} hasChanges={hasChanges} onSave={() => saveMutation.mutate()} />
      <SettingsSubTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'permissions' && (
        <PermissionsSettings permissions={settings.permissions} visibilityOwnOnly={settings.visibility_own_only} visibilityTeam={settings.visibility_team} visibilityAll={settings.visibility_all} onPermissionChange={updatePermission} onVisibilityChange={updateSetting} />
      )}
      {activeTab === 'security' && (
        <SecuritySettings requireApprovalBeforeActivation={settings.require_approval_before_activation} requireApprovalOnChange={settings.require_approval_on_change} fourEyesPrinciple={settings.four_eyes_principle} versioningEnabled={settings.versioning_enabled} auditModules={settings.audit_modules} onSettingChange={updateSetting} onAuditModuleToggle={toggleAuditModule} />
      )}
      {activeTab === 'ai' && (
        <AISettings aiGenerationEnabled={settings.ai_generation_enabled} aiExplanationsEnabled={settings.ai_explanations_enabled} aiOptimizationEnabled={settings.ai_optimization_enabled} aiTranslationEnabled={settings.ai_translation_enabled} aiAutoDecisions={settings.ai_auto_decisions} aiConfidenceThreshold={settings.ai_confidence_threshold} aiLoggingEnabled={settings.ai_logging_enabled} aiDataRetentionDays={settings.ai_data_retention_days} onSettingChange={updateSetting} />
      )}
      {activeTab === 'integrations' && (
        <IntegrationsSettings sevdeskEnabled={settings.sevdesk_enabled} sevdeskApiKey={settings.sevdesk_api_key || ''} sevdeskTenantId={settings.sevdesk_tenant_id || ''} datevEnabled={settings.datev_enabled} datevApiKey={settings.datev_api_key || ''} datevTenantId={settings.datev_tenant_id || ''} slackEnabled={settings.slack_enabled} slackApiKey={settings.slack_api_key || ''} slackTenantId={settings.slack_tenant_id || ''} msTeamsEnabled={settings.ms_teams_enabled} webhooksEnabled={settings.webhooks_enabled} onSettingChange={updateSetting} />
      )}
      {activeTab === 'performance' && (
        <PerformanceSettings maxParallelWorkflows={settings.max_parallel_workflows} maxWorkflowDurationSeconds={settings.max_workflow_duration_seconds} retryStrategy={settings.retry_strategy} maxRetries={settings.max_retries} notifyOnError={settings.notify_on_error} onSettingChange={updateSetting} />
      )}
      {activeTab === 'privacy' && (
        <PrivacySettings gdprCompliant={settings.gdpr_compliant} piiMaskingEnabled={settings.pii_masking_enabled} logEncryptionEnabled={settings.log_encryption_enabled} logRetentionDays={settings.log_retention_days} logAccessRoles={settings.log_access_roles} onSettingChange={updateSetting} onLogAccessRoleToggle={toggleLogAccessRole} />
      )}
    </div>
  );
};
