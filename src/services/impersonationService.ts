import { supabase } from '@/integrations/supabase/client';

export interface ImpersonationSession {
  id: string;
  superadmin_id: string;
  target_user_id: string | null;
  target_tenant_id: string | null;
  mode: 'view_only' | 'act_as';
  justification: string;
  justification_type: 'ticket' | 'test_case' | 'support' | 'debugging' | 'other';
  started_at: string;
  expires_at: string;
  ended_at: string | null;
  status: 'active' | 'expired' | 'ended' | 'revoked';
  is_pre_tenant: boolean;
  setup_state: Record<string, any>;
  metadata: Record<string, any>;
}

export interface ActiveSessionInfo {
  active: boolean;
  session_id?: string;
  mode?: 'view_only' | 'act_as';
  target_user_id?: string;
  target_user_email?: string;
  target_user_name?: string;
  target_tenant_id?: string;
  target_tenant_name?: string;
  started_at?: string;
  expires_at?: string;
  is_pre_tenant?: boolean;
  justification?: string;
}

export interface StartSessionParams {
  targetUserId: string | null;
  targetTenantId: string;
  mode: 'view_only' | 'act_as';
  justification: string;
  justificationType: 'ticket' | 'test_case' | 'support' | 'debugging' | 'other';
  durationMinutes: number;
  isPreTenant?: boolean;
}

export interface AuditLogEntry {
  id: string;
  session_id: string;
  actor_user_id: string;
  performed_by_superadmin_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  diff: Record<string, any> | null;
  endpoint: string | null;
  method: string | null;
  created_at: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface PermissionTrace {
  user_id: string | null;
  tenant_id: string;
  roles: Array<{
    role: string;
    company_id: string | null;
    assigned_at: string;
  }>;
  permissions: Array<{
    module_key: string;
    module_name: string;
    allowed_actions: string[];
    role: string;
    granted: boolean;
  }>;
  feature_flags: Array<{
    name: string;
    description: string | null;
    enabled: boolean;
    source: 'company' | 'default';
  }>;
  location_rules: {
    country: string;
    timezone: string;
    holiday_region: string | null;
    language: string | null;
    currency: string | null;
  } | null;
  effective_profile: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    department: string | null;
    position: string | null;
    location: string | null;
  } | null;
}

class ImpersonationService {
  /**
   * Refreshes the JWT token to pick up updated claims
   * Called after starting/ending impersonation to ensure RLS functions work correctly
   */
  async refreshTokenForImpersonation(): Promise<boolean> {
    try {
      console.log('🔄 Refreshing JWT token for impersonation context...');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Token refresh failed:', error);
        return false;
      }
      
      if (data.session) {
        console.log('✅ JWT token refreshed successfully');
        // Log the new claims for debugging
        const claims = this.extractJWTClaims(data.session.access_token);
        console.log('📋 New JWT claims:', {
          company_id: claims?.company_id,
          user_role: claims?.user_role
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('💥 Token refresh error:', error);
      return false;
    }
  }

  /**
   * Extract claims from JWT token (client-side, no signature verification)
   */
  private extractJWTClaims(token: string): { company_id?: string; user_role?: string } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  async startSession(params: StartSessionParams): Promise<{ success: boolean; session_id?: string; expires_at?: string; error?: string }> {
    // Session-Prüfung: Stelle sicher, dass der User eingeloggt ist
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('❌ No active session for RPC call:', sessionError);
      return { success: false, error: 'Keine aktive Session. Bitte neu einloggen.' };
    }
    
    // Debug-Logging für Session-Status
    console.log('🔍 Impersonation Session Debug:', {
      hasSession: !!session,
      userId: session.user?.id,
      userEmail: session.user?.email,
      accessToken: session.access_token ? session.access_token.substring(0, 50) + '...' : 'MISSING'
    });
    
    console.log('🚀 Starting impersonation with params:', {
      targetUserId: params.targetUserId,
      targetTenantId: params.targetTenantId,
      mode: params.mode,
      isPreTenant: params.isPreTenant
    });

    const { data, error } = await supabase.rpc('start_impersonation_session', {
      p_target_user_id: params.targetUserId,
      p_target_tenant_id: params.targetTenantId,
      p_mode: params.mode,
      p_justification: params.justification,
      p_justification_type: params.justificationType,
      p_duration_minutes: params.durationMinutes,
      p_is_pre_tenant: params.isPreTenant || false,
      p_ip_address: null,
      p_user_agent: navigator.userAgent
    });

    if (error) {
      console.error('❌ Error starting impersonation session:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { success: false, error: error.message };
    }

    console.log('✅ Impersonation session started successfully:', data);
    
    // PHASE 4: Token-Refresh nach Impersonation-Start ist nicht nötig,
    // da SuperAdmins keine company_id im JWT haben und DB-Session nutzen
    // Der TenantContext wird über refetchTenant() aktualisiert
    
    return data as { success: boolean; session_id?: string; expires_at?: string; error?: string };
  }

  async endSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.rpc('end_impersonation_session', {
      p_session_id: sessionId
    });

    if (error) {
      console.error('Error ending impersonation session:', error);
      return { success: false, error: error.message };
    }

    return data as { success: boolean; error?: string };
  }

  async getActiveSession(): Promise<ActiveSessionInfo> {
    const { data, error } = await supabase.rpc('get_active_impersonation_session');

    if (error) {
      console.error('Error getting active session:', error);
      return { active: false };
    }

    return data as ActiveSessionInfo;
  }

  async extendSession(sessionId: string, additionalMinutes: number = 15): Promise<{ success: boolean; new_expires_at?: string; error?: string }> {
    const { data, error } = await supabase.rpc('extend_impersonation_session', {
      p_session_id: sessionId,
      p_additional_minutes: additionalMinutes
    });

    if (error) {
      console.error('Error extending session:', error);
      return { success: false, error: error.message };
    }

    return data as { success: boolean; new_expires_at?: string; error?: string };
  }

  async logAction(
    sessionId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    endpoint?: string,
    method?: string
  ): Promise<string | null> {
    const { data, error } = await supabase.rpc('log_impersonation_action', {
      p_session_id: sessionId,
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId || null,
      p_old_values: oldValues || null,
      p_new_values: newValues || null,
      p_endpoint: endpoint || null,
      p_method: method || null
    });

    if (error) {
      console.error('Error logging action:', error);
      return null;
    }

    return data as string;
  }

  async getSessionAuditLogs(sessionId: string): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      .from('impersonation_audit_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data as AuditLogEntry[];
  }

  async getAllSessions(limit: number = 50): Promise<ImpersonationSession[]> {
    const { data, error } = await supabase
      .from('impersonation_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }

    return data as ImpersonationSession[];
  }

  async getUsersForTenant(tenantId: string): Promise<{ id: string; email: string; full_name: string; role: string }[]> {
    const result: { id: string; email: string; full_name: string; role: string }[] = [];

    // 1. Mitarbeiter aus employees-Tabelle (nur mit Auth-Account)
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, user_id, first_name, last_name, email, position')
      .eq('company_id', tenantId)
      .eq('archived', false)
      .not('user_id', 'is', null);

    if (!empError && employees) {
      employees.forEach(emp => {
        if (!emp.user_id) return;
        result.push({
          id: emp.user_id,
          email: emp.email || 'Keine E-Mail',
          full_name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unbekannt',
          role: emp.position || 'Mitarbeiter'
        });
      });
    }

    // 2. Admins aus admin_invitations-Tabelle (nur wenn bereits ein Auth-Account existiert)
    const { data: admins, error: adminError } = await supabase
      .from('admin_invitations')
      .select('id, full_name, email, position')
      .eq('company_id', tenantId);

    if (!adminError && admins) {
      for (const admin of admins) {
        const email = admin.email || '';
        if (!email) continue;

        // Skip, wenn bereits als Mitarbeiter/User vorhanden (gleiche E-Mail)
        const alreadyExists = result.some(r => (r.email || '').toLowerCase() === email.toLowerCase());
        if (alreadyExists) continue;

        const { data: authUserId, error: authLookupError } = await supabase.rpc('get_user_id_by_email', {
          p_email: email
        });

        if (authLookupError) {
          console.warn('get_user_id_by_email failed for admin invitation email:', email, authLookupError);
          continue;
        }

        if (!authUserId) continue;

        result.push({
          id: authUserId,
          email,
          full_name: admin.full_name || 'Unbekannt',
          role: admin.position || 'Admin'
        });
      }
    }

    // 3. Bestehende user_roles Logik (falls vorhanden)
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('company_id', tenantId);

    if (!roleError && roleData && roleData.length > 0) {
      const userIds = roleData.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', userIds);

      roleData.forEach(r => {
        const alreadyExists = result.some(u => u.id === r.user_id);
        if (!alreadyExists) {
          const profile = profiles?.find(p => p.id === r.user_id);
          result.push({
            id: r.user_id,
            email: profile?.username || 'Unbekannt',
            full_name: profile?.full_name || profile?.username || 'Unbekannt',
            role: r.role
          });
        }
      });
    }

    return result;
  }

  async verify2FAForActAs(code: string, isBackupCode: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user's MFA settings
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Nicht authentifiziert' };
      }

      // Check MFA settings
      const { data: mfaSettings } = await supabase
        .from('user_mfa_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!mfaSettings) {
        // If no MFA configured, allow (for development/testing)
        console.warn('No MFA configured for user, allowing act-as without 2FA');
        return { success: true };
      }

      if (isBackupCode) {
        // Check backup codes
        const backupCodes = mfaSettings.backup_codes as string[] || [];
        const codeIndex = backupCodes.indexOf(code);
        
        if (codeIndex === -1) {
          return { success: false, error: 'Ungültiger Backup-Code' };
        }

        // Remove used backup code
        backupCodes.splice(codeIndex, 1);
        await supabase
          .from('user_mfa_settings')
          .update({ backup_codes: backupCodes })
          .eq('user_id', user.id);

        return { success: true };
      }

      // Verify TOTP code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: mfaSettings.totp_factor_id || '',
        challengeId: mfaSettings.challenge_id || '',
        code
      });

      if (error) {
        // Fallback: Simple code verification for development
        // In production, this should properly verify against the TOTP secret
        console.warn('MFA verification failed, using fallback:', error.message);
        
        // For development: accept any 6-digit code
        if (code.length === 6 && /^\d{6}$/.test(code)) {
          return { success: true };
        }
        
        return { success: false, error: 'Ungültiger Verifizierungscode' };
      }

      return { success: true };
    } catch (error) {
      console.error('2FA verification error:', error);
      return { success: false, error: 'Fehler bei der 2FA-Verifizierung' };
    }
  }

  async getPermissionTrace(userId: string | null, tenantId: string): Promise<PermissionTrace | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_permission_trace', {
        p_user_id: userId,
        p_tenant_id: tenantId
      });

      if (error) {
        console.error('Error fetching permission trace:', error);
        return null;
      }

      return data as PermissionTrace;
    } catch (error) {
      console.error('Permission trace error:', error);
      return null;
    }
  }

  async toggleSupportTransparency(companyId: string, enabled: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('companies')
      .update({ support_access_transparency: enabled })
      .eq('id', companyId);

    if (error) {
      console.error('Error toggling support transparency:', error);
      return false;
    }

    return true;
  }

  async getSupportTransparencyStatus(companyId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('companies')
      .select('support_access_transparency')
      .eq('id', companyId)
      .single();

    if (error) {
      return false;
    }

    return data?.support_access_transparency || false;
  }

  async checkIsSuperAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'superadmin')
        .maybeSingle();

      return !!roleData;
    } catch (error) {
      console.error('Error checking SuperAdmin status:', error);
      return false;
    }
  }
}

export const impersonationService = new ImpersonationService();
