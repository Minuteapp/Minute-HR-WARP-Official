import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  action: string;
  resourceType: string;
  resourceId?: string;
  success?: boolean;
  details?: Record<string, any>;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

interface SensitiveOperation {
  operationType: string;
  operationDetails: Record<string, any>;
  requiresApproval?: boolean;
}

/**
 * Erweiterte sichere Audit-Logging-Funktion mit IP-Tracking
 */
export const logSecurityEvent = async (event: SecurityEvent): Promise<void> => {
  try {
    // Client-seitige Informationen sammeln
    const userAgent = navigator.userAgent;
    const timestamp = new Date().toISOString();
    
    // Zusätzliche Sicherheitsinformationen
    const enrichedDetails = {
      ...event.details,
      timestamp,
      browser: getBrowserInfo(),
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || 'direct'
    };

    // Verwende die sichere Supabase-Funktion für Audit-Logging
    const { error } = await supabase.rpc('log_security_event', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_action: event.action,
      p_resource_type: event.resourceType,
      p_resource_id: event.resourceId || null,
      p_ip_address: null, // Wird server-seitig ermittelt
      p_user_agent: userAgent,
      p_success: event.success ?? true,
      p_details: enrichedDetails
    });
    
    if (error) {
      console.error('Fehler beim Protokollieren des Sicherheitsereignisses:', error);
    }
  } catch (error) {
    console.error('Fehler beim Audit-Logging:', error);
  }
};

/**
 * Protokolliert sensible Operationen für erweiterte Überwachung
 */
export const logSensitiveOperation = async (operation: SensitiveOperation): Promise<string | null> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return null;

    const { data, error } = await supabase
      .from('sensitive_operations_log')
      .insert({
        user_id: user.id,
        operation_type: operation.operationType,
        operation_details: operation.operationDetails,
        requires_approval: operation.requiresApproval || false,
        ip_address: null, // Wird server-seitig ermittelt
        user_agent: navigator.userAgent
      })
      .select('id')
      .single();

    if (error) {
      console.error('Fehler beim Protokollieren der sensiblen Operation:', error);
      return null;
    }

    // Auch als Sicherheitsereignis protokollieren
    await logSecurityEvent({
      action: 'sensitive_operation_logged',
      resourceType: 'sensitive_operation',
      resourceId: data.id,
      success: true,
      details: {
        operation_type: operation.operationType,
        requires_approval: operation.requiresApproval
      },
      riskLevel: operation.requiresApproval ? 'high' : 'medium'
    });

    return data.id;
  } catch (error) {
    console.error('Fehler beim Protokollieren der sensiblen Operation:', error);
    return null;
  }
};

/**
 * Browser-Informationen für erweiterte Sicherheitsanalyse
 */
const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  return {
    name: browser,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    platform: navigator.platform
  };
};

/**
 * Log Login-Versuche
 */
export const logLoginAttempt = async (email: string, success: boolean, error?: string) => {
  await logSecurityEvent({
    action: 'login_attempt',
    resourceType: 'auth',
    resourceId: email,
    success,
    details: {
      email,
      error: error || undefined,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Log Rollenänderungen
 */
export const logRoleChange = async (
  targetUserId: string, 
  oldRole: string, 
  newRole: string
) => {
  await logSecurityEvent({
    action: 'role_change',
    resourceType: 'user_role',
    resourceId: targetUserId,
    success: true,
    details: {
      targetUserId,
      oldRole,
      newRole,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Log verdächtige Aktivitäten
 */
export const logSuspiciousActivity = async (
  activity: string, 
  details: Record<string, any>
) => {
  await logSecurityEvent({
    action: 'suspicious_activity',
    resourceType: 'security',
    success: false,
    details: {
      activity,
      ...details,
      timestamp: new Date().toISOString()
    }
  });
};