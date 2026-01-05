import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePolicyEngine } from './usePolicyEngine';
import { useToast } from '@/hooks/use-toast';

interface PolicyGuardOptions {
  showToast?: boolean;
  fallbackAllowed?: boolean;
  requiredContext?: Record<string, any>;
}

export const usePolicyEnforcement = () => {
  const { checkPolicyEnforcement } = usePolicyEngine();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Universeller Policy-Guard für Module
  const enforcePolicies = useCallback(async (
    moduleName: string,
    action: string,
    context: Record<string, any> = {},
    options: PolicyGuardOptions = {}
  ) => {
    if (!currentUser) {
      if (options.showToast) {
        toast({
          title: "Authentifizierung erforderlich",
          description: "Sie müssen angemeldet sein, um diese Aktion auszuführen.",
          variant: "destructive",
        });
      }
      return false;
    }

    try {
      const result = await checkPolicyEnforcement(
        currentUser.id,
        moduleName,
        action,
        { ...context, ...options.requiredContext }
      );

      if (!result.allowed && options.showToast && result.blocked_by) {
        const reasons = result.blocked_by.map(block => block.reason).join(', ');
        toast({
          title: "Aktion nicht erlaubt",
          description: `Diese Aktion ist durch Sicherheitsrichtlinien blockiert: ${reasons}`,
          variant: "destructive",
        });
      }

      return result.allowed;
    } catch (error) {
      console.error('Policy enforcement error:', error);
      return options.fallbackAllowed ?? false;
    }
  }, [currentUser, checkPolicyEnforcement, toast]);

  // Spezifische Guards für verschiedene Aktionen
  const guards = {
    // Zeiterfassung
    canCheckIn: (context: { qr_scanned?: boolean; location_verified?: boolean } = {}) =>
      enforcePolicies('timetracking', 'time_check_in', context, { 
        showToast: true, 
        fallbackAllowed: true 
      }),

    canCheckOut: (context: { location_verified?: boolean } = {}) =>
      enforcePolicies('timetracking', 'time_check_out', context, { 
        showToast: true, 
        fallbackAllowed: true 
      }),

    canEditTimeEntry: (context: Record<string, any> = {}) =>
      enforcePolicies('timetracking', 'time_entry_edit', context, { 
        showToast: true, 
        fallbackAllowed: false 
      }),

    // Abwesenheiten
    canCreateAbsenceRequest: (context: Record<string, any> = {}) =>
      enforcePolicies('absence', 'create_request', context, { 
        showToast: true, 
        fallbackAllowed: true 
      }),

    canApproveAbsence: (context: Record<string, any> = {}) =>
      enforcePolicies('absence', 'approve_request', context, { 
        showToast: true, 
        fallbackAllowed: false 
      }),

    // Dokumente
    canUploadDocument: (context: { document_type?: string; confidential?: boolean } = {}) =>
      enforcePolicies('documents', 'upload', context, { 
        showToast: true, 
        fallbackAllowed: false 
      }),

    canDownloadDocument: (context: { document_type?: string; confidential?: boolean } = {}) =>
      enforcePolicies('documents', 'download', context, { 
        showToast: true, 
        fallbackAllowed: false 
      }),

    // Sicherheit
    canAccessModule: (moduleName: string, context: { mfa_verified?: boolean } = {}) =>
      enforcePolicies(moduleName, 'access', context, { 
        showToast: true, 
        fallbackAllowed: false 
      }),

    canModifySettings: (settingCategory: string, context: Record<string, any> = {}) =>
      enforcePolicies('settings', `modify_${settingCategory}`, context, { 
        showToast: true, 
        fallbackAllowed: false 
      }),

    // Geschäftsreisen
    canCreateBusinessTrip: (context: Record<string, any> = {}) =>
      enforcePolicies('business_travel', 'create_trip', context, { 
        showToast: true, 
        fallbackAllowed: true 
      }),

    canApproveBusinessTrip: (context: Record<string, any> = {}) =>
      enforcePolicies('business_travel', 'approve_trip', context, { 
        showToast: true, 
        fallbackAllowed: false 
      })
  };

  // Hook für Komponenten-Level Policy Guards
  const usePolicyGuard = (
    moduleName: string, 
    action: string, 
    context: Record<string, any> = {}
  ) => {
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAccess = async () => {
        setIsLoading(true);
        const allowed = await enforcePolicies(moduleName, action, context, { 
          fallbackAllowed: false 
        });
        setIsAllowed(allowed);
        setIsLoading(false);
      };

      if (currentUser) {
        checkAccess();
      } else {
        setIsAllowed(false);
        setIsLoading(false);
      }
    }, [moduleName, action, JSON.stringify(context), currentUser]);

    return { isAllowed, isLoading };
  };

  return {
    enforcePolicies,
    guards,
    usePolicyGuard,
    currentUser
  };
};