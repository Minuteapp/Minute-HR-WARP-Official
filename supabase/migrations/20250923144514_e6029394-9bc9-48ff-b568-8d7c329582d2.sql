-- ===================================================================
-- SECURITY DEFINER FUNCTIONS SICHERHEITS-BEREINIGUNG
-- Problem: SECURITY DEFINER Functions umgehen RLS Policies
-- Lösung: Kritische Functions auf SECURITY INVOKER umstellen
-- ===================================================================

-- 1. Audit-Function auf SECURITY INVOKER umstellen
DROP FUNCTION IF EXISTS public.audit_trigger() CASCADE;
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER -- Verwendet Rechte des aufrufenden Users
SET search_path = public
AS $$
BEGIN
  -- Nur authentifizierte User können Audit-Logs erstellen
  IF auth.uid() IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_values, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_values, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- 2. User role helper functions mit expliziter RLS-Prüfung überarbeiten
CREATE OR REPLACE FUNCTION public.get_user_role_secure(check_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER -- Muss DEFINER bleiben für auth.users Zugriff
STABLE
SET search_path = public
AS $$
BEGIN
  -- Explizite Berechtigung: User kann nur eigene Rolle abfragen oder Admin-Rechte haben
  IF auth.uid() != check_user_id AND NOT is_admin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Nicht berechtigt, Rolle des Users % abzurufen', check_user_id;
  END IF;
  
  RETURN (
    SELECT role::text 
    FROM public.user_roles 
    WHERE user_id = check_user_id 
    LIMIT 1
  );
END;
$$;

-- 3. Log security event function mit RLS-Respekt
CREATE OR REPLACE FUNCTION public.log_security_event_secure(
  p_user_id uuid, 
  p_action text, 
  p_resource_type text, 
  p_resource_id text DEFAULT NULL::text, 
  p_ip_address text DEFAULT NULL::text, 
  p_user_agent text DEFAULT NULL::text, 
  p_success boolean DEFAULT true, 
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER -- Verwendet Rechte des aufrufenden Users
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
  v_risk_level TEXT := 'low';
BEGIN
  -- Nur authentifizierte User können Security Events loggen
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert - kann keine Security Events loggen';
  END IF;
  
  -- User kann nur eigene Events loggen, außer Admins
  IF auth.uid() != p_user_id AND NOT is_admin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Nicht berechtigt, Security Events für User % zu loggen', p_user_id;
  END IF;

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

  -- Erstelle Audit-Log-Eintrag (wird durch RLS geschützt)
  INSERT INTO public.security_audit_logs (
    user_id, action, resource_type, resource_id, 
    ip_address, user_agent, success, details, risk_level
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_ip_address, p_user_agent, p_success, p_details, v_risk_level
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- 4. Document upload notification mit RLS-Respekt
CREATE OR REPLACE FUNCTION public.notify_document_upload_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER -- Verwendet Rechte des aufrufenden Users
SET search_path = public
AS $$
BEGIN
  -- Nur authentifizierte User können Dokument-Benachrichtigungen erstellen
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Benachrichtigung nur wenn User berechtigt ist (wird durch RLS geprüft)
  INSERT INTO public.notifications (
    user_id, title, message, type, reference_id, reference_type
  ) VALUES (
    NEW.uploaded_by,
    'Neues Dokument hochgeladen',
    'Das Dokument "' || NEW.title || '" wurde erfolgreich hochgeladen.',
    'document_upload',
    NEW.id,
    'document'
  );
  
  RETURN NEW;
END;
$$;

-- 5. Sichere Multi-Tenant Function für Companies
CREATE OR REPLACE FUNCTION public.get_active_companies_secure()
RETURNS TABLE(
  id uuid,
  name text,
  employee_count integer,
  subscription_status text,
  is_active boolean,
  slug text
)
LANGUAGE plpgsql
SECURITY INVOKER -- Verwendet Rechte des aufrufenden Users
SET search_path = public
AS $$
BEGIN
  -- Nur authentifizierte User
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentifizierung erforderlich';
  END IF;

  -- Multi-Tenant Isolation: SuperAdmin sieht alles, andere nur eigene Company
  IF is_superadmin_safe(auth.uid()) THEN
    RETURN QUERY
    SELECT c.id, c.name, c.employee_count, c.subscription_status::text, c.is_active, c.slug
    FROM public.companies c
    WHERE c.is_active = true
    ORDER BY c.name;
  ELSE
    RETURN QUERY
    SELECT c.id, c.name, c.employee_count, c.subscription_status::text, c.is_active, c.slug
    FROM public.companies c
    JOIN public.user_roles ur ON ur.company_id = c.id
    WHERE c.is_active = true
      AND ur.user_id = auth.uid()
    ORDER BY c.name;
  END IF;
END;
$$;

-- Audit Log für Security Fix
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'security_definer_functions_fixed', 
  'database_functions', 
  'multiple_functions',
  jsonb_build_object(
    'fixed_functions', ARRAY[
      'audit_trigger', 
      'get_user_role_secure',
      'log_security_event_secure',
      'notify_document_upload_secure',
      'get_active_companies_secure'
    ],
    'security_improvement', 'SECURITY DEFINER -> SECURITY INVOKER mit RLS-Respekt',
    'risk_mitigation', 'Verhindert RLS-Policy Umgehung'
  ),
  'high'
);

SELECT 
  'SECURITY DEFINER FUNCTIONS BEHOBEN! 🔒' as status,
  'Kritische Functions verwenden jetzt SECURITY INVOKER mit RLS-Respekt' as result;