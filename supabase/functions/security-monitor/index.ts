import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitRequest {
  endpoint: string;
  action: string;
  userId?: string;
}

interface SecurityEventRequest {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...payload } = await req.json();
    const authHeader = req.headers.get('Authorization');
    const clientIP = req.headers.get('CF-Connecting-IP') || 
                     req.headers.get('X-Forwarded-For') || 
                     'unknown';
    const userAgent = req.headers.get('User-Agent') || 'unknown';

    console.log(`Security Monitor - Action: ${action}, IP: ${clientIP}`);

    switch (action) {
      case 'check_rate_limit':
        return await handleRateLimit(supabase, payload as RateLimitRequest, clientIP, req);
        
      case 'log_security_event':
        return await handleSecurityEvent(supabase, payload as SecurityEventRequest, clientIP, userAgent, authHeader);
        
      case 'detect_suspicious_activity':
        return await handleSuspiciousActivityDetection(supabase, clientIP, userAgent);
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Security Monitor Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Rate Limiting Handler
 */
async function handleRateLimit(
  supabase: any, 
  request: RateLimitRequest, 
  clientIP: string,
  req: Request
): Promise<Response> {
  const { endpoint, userId } = request;
  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - 15); // 15-Minuten-Fenster
  const windowEnd = new Date();

  try {
    // Aktuelle Rate-Limit-Einträge prüfen
    const { data: existingLimits, error: fetchError } = await supabase
      .from('api_rate_limits')
      .select('*')
      .eq('endpoint', endpoint)
      .eq('ip_address', clientIP)
      .gte('window_start', windowStart.toISOString())
      .lte('window_end', windowEnd.toISOString());

    if (fetchError) {
      console.error('Rate limit fetch error:', fetchError);
      return new Response(
        JSON.stringify({ allowed: true, warning: 'Rate limit check failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate-Limits basierend auf Endpoint
    const limits: Record<string, number> = {
      '/api/auth/login': 5,
      '/api/auth/signup': 3,
      '/api/admin/*': 100,
      '/api/documents/*': 50,
      default: 200
    };

    const currentLimit = limits[endpoint] || limits.default;
    const currentCount = existingLimits?.length || 0;

    // Prüfe ob blockiert
    const blocked = existingLimits?.find((limit: any) => limit.blocked_until && new Date(limit.blocked_until) > new Date());
    if (blocked) {
      await logSecurityEvent(supabase, {
        action: 'rate_limit_blocked',
        resourceType: 'api_request',
        resourceId: endpoint,
        details: {
          ip_address: clientIP,
          endpoint,
          user_id: userId,
          blocked_until: blocked.blocked_until
        },
        riskLevel: 'high'
      }, clientIP, req.headers.get('User-Agent') || 'unknown');

      return new Response(
        JSON.stringify({ 
          allowed: false, 
          error: 'Rate limit exceeded', 
          retryAfter: Math.ceil((new Date(blocked.blocked_until).getTime() - Date.now()) / 1000)
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate-Limit überschritten?
    if (currentCount >= currentLimit) {
      const blockUntil = new Date();
      blockUntil.setMinutes(blockUntil.getMinutes() + 15); // 15 Minuten Sperre

      // Neue Blockierung einfügen
      await supabase
        .from('api_rate_limits')
        .insert({
          user_id: userId,
          ip_address: clientIP,
          endpoint,
          request_count: currentCount + 1,
          window_start: windowStart.toISOString(),
          window_end: windowEnd.toISOString(),
          blocked_until: blockUntil.toISOString()
        });

      await logSecurityEvent(supabase, {
        action: 'rate_limit_exceeded',
        resourceType: 'api_request',
        resourceId: endpoint,
        details: {
          ip_address: clientIP,
          endpoint,
          user_id: userId,
          request_count: currentCount + 1,
          limit: currentLimit
        },
        riskLevel: 'medium'
      }, clientIP, req.headers.get('User-Agent') || 'unknown');

      return new Response(
        JSON.stringify({ 
          allowed: false, 
          error: 'Rate limit exceeded', 
          retryAfter: 900 // 15 Minuten
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Neuen Request zählen
    await supabase
      .from('api_rate_limits')
      .insert({
        user_id: userId,
        ip_address: clientIP,
        endpoint,
        request_count: 1,
        window_start: windowStart.toISOString(),
        window_end: windowEnd.toISOString()
      });

    return new Response(
      JSON.stringify({ 
        allowed: true, 
        remaining: currentLimit - currentCount - 1,
        resetTime: windowEnd.getTime()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Rate limit error:', error);
    return new Response(
      JSON.stringify({ allowed: true, warning: 'Rate limit check failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Security Event Handler
 */
async function handleSecurityEvent(
  supabase: any, 
  event: SecurityEventRequest, 
  clientIP: string, 
  userAgent: string,
  authHeader?: string | null
): Promise<Response> {
  try {
    let userId = null;
    
    // Versuche User-ID aus Auth-Token zu extrahieren
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id;
      } catch (error) {
        console.log('Could not extract user from token');
      }
    }

    const { error } = await supabase
      .from('security_audit_logs')
      .insert({
        user_id: userId,
        action: event.action,
        resource_type: event.resourceType,
        resource_id: event.resourceId,
        ip_address: clientIP,
        user_agent: userAgent,
        success: true,
        details: event.details || {},
        risk_level: event.riskLevel || 'low'
      });

    if (error) {
      console.error('Security event logging error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to log security event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Security event error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Verdächtige Aktivitäten-Erkennung
 */
async function handleSuspiciousActivityDetection(
  supabase: any, 
  clientIP: string, 
  userAgent: string
): Promise<Response> {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Prüfe auf verdächtige Muster
    const { data: recentEvents, error } = await supabase
      .from('security_audit_logs')
      .select('*')
      .eq('ip_address', clientIP)
      .gte('created_at', oneHourAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Suspicious activity check error:', error);
      return new Response(
        JSON.stringify({ suspicious: false, warning: 'Check failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let suspiciousFactors = [];
    let riskScore = 0;

    // Zu viele fehlgeschlagene Login-Versuche
    const failedLogins = recentEvents?.filter((e: any) => 
      e.action === 'login_attempt' && e.success === false
    ).length || 0;
    
    if (failedLogins >= 5) {
      suspiciousFactors.push('Multiple failed login attempts');
      riskScore += 30;
    }

    // Zu viele verschiedene User-Agents von gleicher IP
    const uniqueUserAgents = new Set(recentEvents?.map((e: any) => e.user_agent) || []);
    if (uniqueUserAgents.size >= 5) {
      suspiciousFactors.push('Multiple user agents from same IP');
      riskScore += 20;
    }

    // Sehr hohe Aktivität
    if (recentEvents && recentEvents.length >= 100) {
      suspiciousFactors.push('Unusually high activity');
      riskScore += 25;
    }

    // Zugriff auf sensible Ressourcen
    const sensitiveAccess = recentEvents?.filter((e: any) => 
      e.action.includes('admin') || e.resource_type.includes('user_role')
    ).length || 0;
    
    if (sensitiveAccess >= 10) {
      suspiciousFactors.push('High sensitive resource access');
      riskScore += 40;
    }

    const isSuspicious = riskScore >= 50;

    if (isSuspicious) {
      await logSecurityEvent(supabase, {
        action: 'suspicious_activity_detected',
        resourceType: 'security_monitoring',
        details: {
          ip_address: clientIP,
          user_agent: userAgent,
          risk_score: riskScore,
          factors: suspiciousFactors,
          event_count: recentEvents?.length || 0
        },
        riskLevel: riskScore >= 80 ? 'critical' : 'high'
      }, clientIP, userAgent);
    }

    return new Response(
      JSON.stringify({ 
        suspicious: isSuspicious,
        riskScore,
        factors: suspiciousFactors,
        recommendation: isSuspicious ? 'Consider blocking or monitoring this IP' : 'Activity appears normal'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Suspicious activity detection error:', error);
    return new Response(
      JSON.stringify({ suspicious: false, error: 'Detection failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Helper: Log Security Event
 */
async function logSecurityEvent(
  supabase: any, 
  event: SecurityEventRequest, 
  clientIP: string, 
  userAgent: string
): Promise<void> {
  try {
    await supabase
      .from('security_audit_logs')
      .insert({
        user_id: null,
        action: event.action,
        resource_type: event.resourceType,
        resource_id: event.resourceId,
        ip_address: clientIP,
        user_agent: userAgent,
        success: true,
        details: event.details || {},
        risk_level: event.riskLevel || 'low'
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}