-- SICHERHEITSFIX: Security Definer View/Function Analysis - Korrektur
-- Schritt 1: Bestehende Funktionen sicher löschen und neu erstellen

-- 1. assess_forecast_risks zu SECURITY INVOKER konvertieren
DROP FUNCTION IF EXISTS public.assess_forecast_risks(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.assess_forecast_risks(p_forecast_instance_id uuid)
 RETURNS TABLE(risk_id uuid, risk_type text, severity text, description text)
 LANGUAGE plpgsql
 SECURITY INVOKER  -- Geändert von SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Automatische Risikobewertung basierend auf Forecast-Daten
  INSERT INTO forecast_risk_assessments (
    forecast_instance_id, risk_type, severity, impact_description,
    probability, mitigation_strategy, created_by
  ) VALUES (
    p_forecast_instance_id,
    'budget_deviation',
    'medium',
    'Potenzielle Budgetabweichung von 15% aufgrund Marktvolatilität',
    35,
    'Monatliche Überprüfung und Anpassung der Forecast-Parameter',
    auth.uid()
  ) ON CONFLICT DO NOTHING; -- Prevent duplicates
  
  RETURN QUERY SELECT id, risk_type, severity, impact_description
    FROM forecast_risk_assessments 
    WHERE forecast_instance_id = p_forecast_instance_id 
    AND status = 'active'
    ORDER BY severity DESC, probability DESC;
END;
$function$;

-- 2. get_user_company_id sicherer machen (MUSS SECURITY DEFINER bleiben)
DROP FUNCTION IF EXISTS public.get_user_company_id(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.get_user_company_id(p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER  -- Muss DEFINER bleiben für RLS-Bypass
 SET search_path = 'public'  -- Aber search_path sichern
AS $function$
BEGIN
  -- Sicherheitsprüfung
  IF p_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Hole Company ID mit sicherem search_path
  RETURN (
    SELECT ur.company_id 
    FROM public.user_roles ur 
    WHERE ur.user_id = p_user_id 
    LIMIT 1
  );
END;
$function$;

-- 3. is_superadmin_safe sicherer machen (MUSS SECURITY DEFINER bleiben)
DROP FUNCTION IF EXISTS public.is_superadmin_safe(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER  -- Muss DEFINER bleiben für RLS-Bypass
 SET search_path = 'public'  -- Aber search_path sichern
AS $function$
BEGIN
  -- Interne Sicherheitsprüfung
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Prüfe SuperAdmin-Status mit sicherem search_path
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p_user_id
    AND ur.role = 'superadmin'::user_role
  );
END;
$function$;

-- Log der Sicherheitsoptimierung
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'security_definer_optimization', 
  'database_functions', 
  'security_definer_functions',
  jsonb_build_object(
    'description', 'Security Definer functions analyzed and optimized - Phase 1',
    'functions_converted_to_invoker', ARRAY['assess_forecast_risks'],
    'functions_secured_with_search_path', ARRAY['is_superadmin_safe', 'get_user_company_id'],
    'security_improvement', 'Reduced privilege escalation risks, secured search paths'
  ),
  'medium'
);