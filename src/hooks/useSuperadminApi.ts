import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = 'https://teydpbqficbdgqovoqlo.supabase.co';

export function useSuperadminApi() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getToken = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData.session?.access_token;
  };

  const callApi = async (path: string, method: 'GET' | 'POST' = 'POST', body?: any) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/superadmin-api/${path}`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: method !== 'GET' ? JSON.stringify(body || {}) : undefined
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'API call failed');
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  // Tenant methods
  const createTenant = (data: { name: string; country?: string; timezone?: string; industry?: string }) =>
    callApi('tenants', 'POST', data);

  const inviteUser = (tenantId: string, data: { email: string; role: string; full_name?: string }) =>
    callApi(`tenants/${tenantId}/users/invite`, 'POST', data);

  const createTestUser = (tenantId: string, data: { role: string; full_name?: string; email?: string }) =>
    callApi(`tenants/${tenantId}/users/create-test`, 'POST', data);

  const bootstrapOrg = (tenantId: string) =>
    callApi(`tenants/${tenantId}/org/bootstrap`, 'POST');

  const getAuditLog = (tenantId: string, params?: { limit?: number; offset?: number; action?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.action) query.set('action', params.action);
    return callApi(`tenants/${tenantId}/audit-log?${query}`, 'GET');
  };

  const getAllAuditLogs = (params?: { limit?: number; offset?: number; action?: string; tenant_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.action) query.set('action', params.action);
    if (params?.tenant_id) query.set('tenant_id', params.tenant_id);
    return callApi(`audit-log?${query}`, 'GET');
  };

  // IMPERSONATION METHODS
  const startImpersonation = (data: { tenant_id: string; user_id: string; reason: string; mode?: 'view_only' | 'act_as' }) =>
    callApi('superadmin/impersonation/start', 'POST', data);

  const stopImpersonation = (sessionId?: string) =>
    callApi('superadmin/impersonation/stop', 'POST', { session_id: sessionId });

  const getImpersonationStatus = () =>
    callApi('superadmin/impersonation/status', 'GET');

  const extendImpersonation = (sessionId?: string, extendMinutes?: number) =>
    callApi('superadmin/impersonation/extend', 'POST', { session_id: sessionId, extend_minutes: extendMinutes });

  // INTROSPECTION
  const getSystemInventory = async () => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/introspect-system`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get inventory');
    }
    
    return response.json();
  };

  return {
    isLoading,
    createTenant,
    inviteUser,
    createTestUser,
    bootstrapOrg,
    getAuditLog,
    getAllAuditLogs,
    // Impersonation
    startImpersonation,
    stopImpersonation,
    getImpersonationStatus,
    extendImpersonation,
    // Introspection
    getSystemInventory
  };
}
