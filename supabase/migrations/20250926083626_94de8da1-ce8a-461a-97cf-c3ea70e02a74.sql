-- SICHERHEITSREPARATUR TEIL 10: Weitere kritische Funktionen reparieren
-- Mehrere Funktionen mit search_path Problemen beheben

-- log_security_event Funktion härten
CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_action text, p_resource_type text, p_resource_id text DEFAULT NULL::text, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text, p_success boolean DEFAULT true, p_details jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_log_id UUID;
  v_risk_level TEXT := 'low';
BEGIN
  -- Bestimme Risikostufe basierend auf Aktion
  CASE p_action
    WHEN 'login_failed', 'unauthorized_access', 'suspicious_activity' THEN
      v_risk_level := 'medium';
    WHEN 'brute_force_detected', 'sql_injection_attempt', 'admin_action_failed' THEN
      v_risk_level := 'high';
    WHEN 'data_breach_suspected', 'security_policy_violation' THEN
      v_risk_level := 'critical';
    ELSE
      v_risk_level := 'low';
  END CASE;

  -- Erstelle Audit-Log-Eintrag
  INSERT INTO public.security_audit_logs (
    user_id, action, resource_type, resource_id, 
    ip_address, user_agent, success, details, risk_level,
    browser_info, session_info
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_ip_address, p_user_agent, p_success, p_details, v_risk_level,
    COALESCE(p_details->'browser_info', '{}'),
    COALESCE(p_details->'session_info', '{}')
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$function$;

-- handle_updated_at Funktion härten  
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;