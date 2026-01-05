import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  count: number;
  minRequired: number;
  link: string;
  icon: string;
  priority: number;
}

interface OnboardingChecklistState {
  items: ChecklistItem[];
  isLoading: boolean;
  isDismissed: boolean;
  completionPercentage: number;
  allCompleted: boolean;
}

export const useOnboardingChecklist = () => {
  const { tenantCompany, isSuperAdmin } = useTenant();
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingChecklistState>({
    items: [],
    isLoading: true,
    isDismissed: false,
    completionPercentage: 0,
    allCompleted: false,
  });

  const companyId = tenantCompany?.id;

  const loadChecklist = useCallback(async () => {
    // SuperAdmins sehen die Onboarding-Checkliste nicht
    if (isSuperAdmin) {
      setState(prev => ({ ...prev, isLoading: false, isDismissed: true }));
      return;
    }

    if (!companyId) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Check if dismissed
      const { data: profileData } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', user?.id)
        .single();

      const profileMetadata = profileData?.metadata as Record<string, any> | null;
      const isDismissed = profileMetadata?.onboardingChecklistDismissed === true;

      if (isDismissed) {
        setState(prev => ({ ...prev, isLoading: false, isDismissed: true }));
        return;
      }

      // Fetch counts in parallel
      const [
        locationsResult,
        departmentsResult,
        teamsResult,
        employeesResult,
        absenceTypesResult,
      ] = await Promise.all([
        supabase.from('locations').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
        supabase.from('departments').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
        supabase.from('teams').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
        supabase.from('employees').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
        supabase.from('absence_types').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
      ]);

      const items: ChecklistItem[] = [
        {
          id: 'locations',
          title: 'Standorte anlegen',
          description: 'Mindestens einen Firmenstandort erstellen',
          isCompleted: (locationsResult.count || 0) >= 1,
          count: locationsResult.count || 0,
          minRequired: 1,
          link: '/settings/company/locations',
          icon: 'building-2',
          priority: 1,
        },
        {
          id: 'departments',
          title: 'Abteilungen erstellen',
          description: 'Organisationsstruktur mit Abteilungen aufbauen',
          isCompleted: (departmentsResult.count || 0) >= 1,
          count: departmentsResult.count || 0,
          minRequired: 1,
          link: '/settings/company',
          icon: 'network',
          priority: 2,
        },
        {
          id: 'teams',
          title: 'Teams einrichten',
          description: 'Teams für die Zusammenarbeit anlegen',
          isCompleted: (teamsResult.count || 0) >= 1,
          count: teamsResult.count || 0,
          minRequired: 1,
          link: '/settings/company',
          icon: 'users',
          priority: 3,
        },
        {
          id: 'absence_types',
          title: 'Abwesenheitstypen konfigurieren',
          description: 'Urlaub, Krankheit und andere Abwesenheitsarten',
          isCompleted: (absenceTypesResult.count || 0) >= 1,
          count: absenceTypesResult.count || 0,
          minRequired: 1,
          link: '/settings/absence',
          icon: 'calendar-off',
          priority: 4,
        },
        {
          id: 'employees',
          title: 'Mitarbeiter hinzufügen',
          description: 'Erste Mitarbeiter einladen oder anlegen',
          isCompleted: (employeesResult.count || 0) >= 2,
          count: employeesResult.count || 0,
          minRequired: 2,
          link: '/employees',
          icon: 'user-plus',
          priority: 5,
        },
      ];

      const completedCount = items.filter(item => item.isCompleted).length;
      const completionPercentage = Math.round((completedCount / items.length) * 100);

      setState({
        items: items.sort((a, b) => a.priority - b.priority),
        isLoading: false,
        isDismissed: false,
        completionPercentage,
        allCompleted: completedCount === items.length,
      });
    } catch (error) {
      console.error('Error loading onboarding checklist:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [companyId, user?.id, isSuperAdmin]);

  useEffect(() => {
    loadChecklist();
  }, [loadChecklist]);

  const dismissChecklist = async () => {
    if (!user?.id) return;

    try {
      // Get current metadata first
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', user.id)
        .single();

      const currentMetadata = (currentProfile?.metadata as Record<string, any>) || {};

      await supabase
        .from('profiles')
        .update({
          metadata: {
            ...currentMetadata,
            onboardingChecklistDismissed: true,
            onboardingChecklistDismissedAt: new Date().toISOString(),
          }
        })
        .eq('id', user.id);

      setState(prev => ({ ...prev, isDismissed: true }));
    } catch (error) {
      console.error('Error dismissing checklist:', error);
    }
  };

  const showChecklist = async () => {
    if (!user?.id) return;

    try {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', user.id)
        .single();

      const currentMetadata = (currentProfile?.metadata as Record<string, any>) || {};

      await supabase
        .from('profiles')
        .update({
          metadata: {
            ...currentMetadata,
            onboardingChecklistDismissed: false,
          }
        })
        .eq('id', user.id);

      setState(prev => ({ ...prev, isDismissed: false }));
      await loadChecklist();
    } catch (error) {
      console.error('Error showing checklist:', error);
    }
  };

  return {
    ...state,
    reload: loadChecklist,
    dismissChecklist,
    showChecklist,
  };
};
