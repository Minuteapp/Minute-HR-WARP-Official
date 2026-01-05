-- SICHERHEITSFIX #3: Sichere search_path für kritische Funktionen

-- Repariere eine der wichtigsten SECURITY DEFINER Funktionen mit search_path
CREATE OR REPLACE FUNCTION public.is_superadmin(user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Sicherheitsprüfung hinzufügen
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Use table alias to avoid ambiguity
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = $1
    AND ur.role = 'superadmin'::user_role
  );
END;
$$;

-- Sichere is_admin Funktion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Sicherheitsprüfung hinzufügen
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Use table alias to avoid ambiguity
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = $1
    AND ur.role = 'admin'::user_role
  );
END;
$$;

-- Log der Funktions-Sicherheitsreparatur
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'security_definer_function_hardened', 
  'database_function', 
  'is_superadmin,is_admin',
  '{"description": "Added secure search_path and validation to critical admin functions", "severity": "high"}'::jsonb,
  'high'
);