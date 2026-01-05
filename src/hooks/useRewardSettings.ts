import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RewardSettings, RewardPermission, RewardIntegration, defaultRoles } from '@/types/reward-settings';
import { toast } from 'sonner';

export const useRewardSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['reward-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
        return null;
      }

      return data as RewardSettings | null;
    },
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['reward-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_permissions')
        .select('*')
        .order('role');

      if (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }

      if (data.length === 0) {
        return defaultRoles.map(role => ({
          id: role,
          role,
          can_view: true,
          can_create: role === 'Administrator' || role === 'HR-Manager',
          can_approve: role === 'Administrator' || role === 'HR-Manager' || role === 'Teamleiter',
          can_manage: role === 'Administrator',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) as RewardPermission[];
      }

      return data as RewardPermission[];
    },
  });

  const { data: integrations = [] } = useQuery({
    queryKey: ['reward-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_integrations')
        .select('*')
        .order('integration_name');

      if (error) {
        console.error('Error fetching integrations:', error);
        return [];
      }

      // Erstelle Default-Integrationen falls keine existieren
      if (data.length === 0) {
        return [
          {
            id: 'perf-mgmt',
            integration_name: 'Performance Management',
            integration_type: 'performance',
            integration_description: 'Automatische Belohnungen bei Zielerreichung',
            is_connected: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'okr',
            integration_name: 'Ziele & OKRs',
            integration_type: 'okr',
            integration_description: 'Belohnungen für OKR-Erfolge',
            is_connected: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'shift',
            integration_name: 'Schichtplanung',
            integration_type: 'shift',
            integration_description: 'Incentives für Schichtabdeckung',
            is_connected: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ] as RewardIntegration[];
      }

      return data as RewardIntegration[];
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<RewardSettings>) => {
      if (settings?.id) {
        const { error } = await supabase
          .from('reward_settings')
          .update(newSettings)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reward_settings')
          .insert(newSettings);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-settings'] });
      toast.success('Einstellungen gespeichert');
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast.error('Fehler beim Speichern');
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: async (permission: Partial<RewardPermission> & { role: string }) => {
      const existing = permissions.find(p => p.role === permission.role);
      
      if (existing?.id && !existing.id.includes('-')) {
        const { error } = await supabase
          .from('reward_permissions')
          .update(permission)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reward_permissions')
          .upsert({
            role: permission.role,
            can_view: permission.can_view ?? true,
            can_create: permission.can_create ?? false,
            can_approve: permission.can_approve ?? false,
            can_manage: permission.can_manage ?? false,
          }, {
            onConflict: 'company_id,role',
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-permissions'] });
      toast.success('Berechtigung aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating permission:', error);
      toast.error('Fehler beim Aktualisieren');
    },
  });

  const getDefaultSettings = (): Partial<RewardSettings> => ({
    module_name: 'Belohnungen & Goodies',
    module_description: 'Strategisches Incentive- und Anerkennungsmodul',
    is_module_active: true,
    is_peer_recognition_active: true,
    yearly_budget: 45000,
    max_reward_per_employee_monthly: 1000,
    team_lead_approval_threshold: 500,
    budget_warning_enabled: true,
    budget_warning_threshold: 80,
    auto_sync_enabled: true,
    default_payment_type: 'bonus',
    payout_timing: 'next_payroll',
    tax_optimization_enabled: true,
    email_notification_enabled: true,
    notify_new_reward: true,
    notify_approval_required: true,
    notify_budget_warning: true,
    notify_monthly_reports: true,
    ai_recommendations_enabled: true,
    auto_approval_enabled: true,
    auto_approval_threshold: 100,
    ai_confidence_threshold: 85,
    default_language: 'de',
    default_currency: 'EUR',
    tax_region: 'DE',
    gdpr_compliance_enabled: true,
  });

  return {
    settings: settings || getDefaultSettings() as RewardSettings,
    settingsLoading,
    permissions,
    integrations,
    updateSettings: updateSettingsMutation.mutate,
    updatePermission: updatePermissionMutation.mutate,
    isUpdating: updateSettingsMutation.isPending || updatePermissionMutation.isPending,
  };
};
