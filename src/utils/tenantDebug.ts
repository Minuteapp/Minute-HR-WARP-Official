/**
 * Tenant Debug Utilities
 * Hilfsfunktionen zum Debuggen und Testen der JWT-Claim-Optimierung
 */

import { supabase } from '@/integrations/supabase/client';
import { getTenantClaimsFromJWT, decodeJWT } from './jwtParser';

export interface TenantDebugInfo {
  // JWT-basierte Infos
  jwt: {
    hasToken: boolean;
    companyId: string | null;
    userRole: string | null;
    isSuperAdmin: boolean;
    isExpired: boolean;
    expiresAt: string | null;
  };
  // DB-basierte Infos
  database: {
    userId: string | null;
    userEmail: string | null;
    employeeCompanyId: string | null;
    userRolesCompanyId: string | null;
    activeImpersonation: string | null;
    activeTenantSession: string | null;
  };
  // Effektive Werte
  effective: {
    companyId: string | null;
    source: 'jwt' | 'impersonation' | 'tenant_session' | 'employee' | 'none';
    isSuperAdmin: boolean;
  };
  // Timestamps
  timestamp: string;
}

/**
 * Sammelt alle Debug-Informationen zum aktuellen Tenant-Context
 */
export async function getTenantDebugInfo(): Promise<TenantDebugInfo> {
  const debugInfo: TenantDebugInfo = {
    jwt: {
      hasToken: false,
      companyId: null,
      userRole: null,
      isSuperAdmin: false,
      isExpired: true,
      expiresAt: null
    },
    database: {
      userId: null,
      userEmail: null,
      employeeCompanyId: null,
      userRolesCompanyId: null,
      activeImpersonation: null,
      activeTenantSession: null
    },
    effective: {
      companyId: null,
      source: 'none',
      isSuperAdmin: false
    },
    timestamp: new Date().toISOString()
  };

  try {
    // 1. JWT-Infos auslesen
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      debugInfo.jwt.hasToken = true;
      const claims = getTenantClaimsFromJWT(session.access_token);
      debugInfo.jwt.companyId = claims.companyId;
      debugInfo.jwt.userRole = claims.userRole;
      debugInfo.jwt.isSuperAdmin = claims.isSuperAdmin;
      debugInfo.jwt.isExpired = claims.isExpired;
      
      // Expiration Time
      const decoded = decodeJWT(session.access_token);
      if (decoded?.exp) {
        debugInfo.jwt.expiresAt = new Date(decoded.exp * 1000).toISOString();
      }
    }

    // 2. User-Infos
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      debugInfo.database.userId = user.id;
      debugInfo.database.userEmail = user.email || null;

      // 3. Employee-Zuordnung
      const { data: employee } = await supabase
        .from('employees')
        .select('company_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (employee) {
        debugInfo.database.employeeCompanyId = employee.company_id;
      }

      // 4. User-Roles
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('company_id, role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (userRole) {
        debugInfo.database.userRolesCompanyId = userRole.company_id;
      }

      // 5. Aktive Impersonation
      const { data: impersonation } = await supabase
        .from('impersonation_sessions')
        .select('target_tenant_id')
        .eq('superadmin_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (impersonation) {
        debugInfo.database.activeImpersonation = impersonation.target_tenant_id;
      }

      // 6. Tenant-Session
      const { data: tenantSession } = await supabase
        .from('user_tenant_sessions')
        .select('tenant_company_id')
        .eq('user_id', user.id)
        .eq('is_tenant_mode', true)
        .maybeSingle();
      
      if (tenantSession) {
        debugInfo.database.activeTenantSession = tenantSession.tenant_company_id;
      }
    }

    // 7. Effektive Werte bestimmen
    if (debugInfo.jwt.companyId) {
      debugInfo.effective.companyId = debugInfo.jwt.companyId;
      debugInfo.effective.source = 'jwt';
    } else if (debugInfo.database.activeImpersonation) {
      debugInfo.effective.companyId = debugInfo.database.activeImpersonation;
      debugInfo.effective.source = 'impersonation';
    } else if (debugInfo.database.activeTenantSession) {
      debugInfo.effective.companyId = debugInfo.database.activeTenantSession;
      debugInfo.effective.source = 'tenant_session';
    } else if (debugInfo.database.employeeCompanyId) {
      debugInfo.effective.companyId = debugInfo.database.employeeCompanyId;
      debugInfo.effective.source = 'employee';
    }

    debugInfo.effective.isSuperAdmin = debugInfo.jwt.isSuperAdmin || 
      (debugInfo.jwt.userRole === 'superadmin') ||
      (!debugInfo.effective.companyId && !!debugInfo.database.userId);

  } catch (error) {
    console.error('❌ Error collecting tenant debug info:', error);
  }

  return debugInfo;
}

/**
 * Loggt die Debug-Infos formatiert in die Console
 */
export async function logTenantDebugInfo(): Promise<void> {
  const info = await getTenantDebugInfo();
  
  console.group('🔍 Tenant Debug Info');
  
  console.group('📋 JWT Claims');
  console.log('Has Token:', info.jwt.hasToken);
  console.log('Company ID:', info.jwt.companyId || '(none)');
  console.log('User Role:', info.jwt.userRole || '(none)');
  console.log('Is SuperAdmin:', info.jwt.isSuperAdmin);
  console.log('Is Expired:', info.jwt.isExpired);
  console.log('Expires At:', info.jwt.expiresAt || '(unknown)');
  console.groupEnd();
  
  console.group('🗄️ Database');
  console.log('User ID:', info.database.userId || '(not logged in)');
  console.log('User Email:', info.database.userEmail || '(none)');
  console.log('Employee Company:', info.database.employeeCompanyId || '(none)');
  console.log('UserRoles Company:', info.database.userRolesCompanyId || '(none)');
  console.log('Active Impersonation:', info.database.activeImpersonation || '(none)');
  console.log('Active Tenant Session:', info.database.activeTenantSession || '(none)');
  console.groupEnd();
  
  console.group('✅ Effective Values');
  console.log('Company ID:', info.effective.companyId || '(none)');
  console.log('Source:', info.effective.source);
  console.log('Is SuperAdmin:', info.effective.isSuperAdmin);
  console.groupEnd();
  
  console.log('Timestamp:', info.timestamp);
  console.groupEnd();
}

/**
 * Prüft ob die JWT-Claims korrekt gesetzt sind
 */
export async function validateJWTClaims(): Promise<{
  valid: boolean;
  issues: string[];
  suggestions: string[];
}> {
  const info = await getTenantDebugInfo();
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Prüfung 1: Token vorhanden
  if (!info.jwt.hasToken) {
    issues.push('Kein JWT Token gefunden');
    suggestions.push('User muss eingeloggt sein');
    return { valid: false, issues, suggestions };
  }

  // Prüfung 2: Token abgelaufen
  if (info.jwt.isExpired) {
    issues.push('JWT Token ist abgelaufen');
    suggestions.push('Session refreshen oder neu einloggen');
  }

  // Prüfung 3: Company ID fehlt bei Mitarbeiter
  if (info.database.employeeCompanyId && !info.jwt.companyId) {
    issues.push('Mitarbeiter hat company_id in DB, aber nicht im JWT');
    suggestions.push('Custom Access Token Hook aktivieren im Supabase Dashboard');
    suggestions.push('User muss sich neu einloggen nach Hook-Aktivierung');
  }

  // Prüfung 4: SuperAdmin ohne Rolle im JWT
  const { data: isSuperAdmin } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', info.database.userId || '')
    .eq('role', 'superadmin')
    .maybeSingle();

  if (isSuperAdmin && info.jwt.userRole !== 'super_admin' && info.jwt.userRole !== 'superadmin') {
    issues.push('SuperAdmin-Rolle nicht im JWT');
    suggestions.push('Custom Access Token Hook prüfen');
  }

  return {
    valid: issues.length === 0,
    issues,
    suggestions
  };
}

// Globale Debug-Funktion für Browser-Console
if (typeof window !== 'undefined') {
  (window as any).tenantDebug = {
    getInfo: getTenantDebugInfo,
    log: logTenantDebugInfo,
    validate: validateJWTClaims
  };
}
