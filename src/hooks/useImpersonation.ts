import { useState, useEffect, useCallback } from 'react';
import { impersonationService, ActiveSessionInfo, StartSessionParams } from '@/services/impersonationService';
import { useAuth } from '@/contexts/AuthContext';
import { useOriginalRole } from '@/hooks/useOriginalRole';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export interface UseImpersonationReturn {
  // State
  isImpersonating: boolean;
  session: ActiveSessionInfo | null;
  loading: boolean;
  remainingMinutes: number;
  
  // Actions
  startImpersonation: (params: StartSessionParams) => Promise<boolean>;
  endImpersonation: () => Promise<boolean>;
  extendSession: (minutes?: number) => Promise<boolean>;
  
  // Audit
  logAction: (action: string, resourceType: string, resourceId?: string, changes?: { old?: any; new?: any }) => Promise<void>;
  
  // Refresh
  refreshSession: () => Promise<void>;
}

export function useImpersonation(): UseImpersonationReturn {
  const { user } = useAuth();
  const { isOriginalSuperAdmin } = useOriginalRole();
  const { refreshAfterImpersonation } = useTenant();
  
  const [session, setSession] = useState<ActiveSessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingMinutes, setRemainingMinutes] = useState(0);

  const isImpersonating = session?.active || false;

  // Session laden
  const refreshSession = useCallback(async () => {
    if (!user || !isOriginalSuperAdmin) {
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      const activeSession = await impersonationService.getActiveSession();
      setSession(activeSession);
      
      if (activeSession.active && activeSession.expires_at) {
        const expiresAt = new Date(activeSession.expires_at);
        const now = new Date();
        const diffMs = expiresAt.getTime() - now.getTime();
        setRemainingMinutes(Math.max(0, Math.floor(diffMs / 60000)));
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [user, isOriginalSuperAdmin]);

  // Initial load
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Countdown Timer
  useEffect(() => {
    if (!isImpersonating) return;

    const interval = setInterval(() => {
      setRemainingMinutes(prev => {
        if (prev <= 1) {
          refreshSession();
          return 0;
        }
        return prev - 1;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [isImpersonating, refreshSession]);

  // Warnung bei niedriger Zeit
  useEffect(() => {
    if (remainingMinutes === 5 && isImpersonating) {
      toast.warning('Impersonation Session läuft in 5 Minuten ab!', {
        action: {
          label: 'Verlängern',
          onClick: () => extendSession(15)
        }
      });
    }
  }, [remainingMinutes, isImpersonating]);

  const startImpersonation = useCallback(async (params: StartSessionParams): Promise<boolean> => {
    if (!isOriginalSuperAdmin) {
      toast.error('Nur Superadmins können Impersonation-Sessions starten');
      return false;
    }

    setLoading(true);
    try {
      const result = await impersonationService.startSession(params);
      
      if (result.success) {
        toast.success('Impersonation Session gestartet');
        await refreshSession();
        await refreshAfterImpersonation();
        return true;
      } else {
        toast.error(result.error || 'Fehler beim Starten der Session');
        return false;
      }
    } catch (error) {
      console.error('Error starting impersonation:', error);
      toast.error('Fehler beim Starten der Impersonation');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isOriginalSuperAdmin, refreshSession]);

  const endImpersonation = useCallback(async (): Promise<boolean> => {
    if (!session?.session_id) {
      toast.error('Keine aktive Session gefunden');
      return false;
    }

    setLoading(true);
    try {
      const result = await impersonationService.endSession(session.session_id);
      
      if (result.success) {
        toast.success('Impersonation Session beendet');
        setSession(null);
        setRemainingMinutes(0);
        await refreshAfterImpersonation();
        return true;
      } else {
        toast.error(result.error || 'Fehler beim Beenden der Session');
        return false;
      }
    } catch (error) {
      console.error('Error ending impersonation:', error);
      toast.error('Fehler beim Beenden der Impersonation');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session?.session_id]);

  const extendSession = useCallback(async (minutes: number = 15): Promise<boolean> => {
    if (!session?.session_id) {
      toast.error('Keine aktive Session gefunden');
      return false;
    }

    try {
      const result = await impersonationService.extendSession(session.session_id, minutes);
      
      if (result.success) {
        toast.success(`Session um ${minutes} Minuten verlängert`);
        await refreshSession();
        return true;
      } else {
        toast.error(result.error || 'Fehler beim Verlängern');
        return false;
      }
    } catch (error) {
      console.error('Error extending session:', error);
      toast.error('Fehler beim Verlängern der Session');
      return false;
    }
  }, [session?.session_id, refreshSession]);

  const logAction = useCallback(async (
    action: string,
    resourceType: string,
    resourceId?: string,
    changes?: { old?: any; new?: any }
  ): Promise<void> => {
    if (!session?.session_id || session.mode !== 'act_as') return;

    try {
      await impersonationService.logAction(
        session.session_id,
        action,
        resourceType,
        resourceId,
        changes?.old,
        changes?.new
      );
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }, [session?.session_id, session?.mode]);

  return {
    isImpersonating,
    session,
    loading,
    remainingMinutes,
    startImpersonation,
    endImpersonation,
    extendSession,
    logAction,
    refreshSession
  };
}
