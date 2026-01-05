-- KRITISCHE SICHERHEITSFUNKTION REPARATUR (minimaler Ansatz)
-- Problem: is_superadmin_safe versucht auf auth.users zuzugreifen (nicht erlaubt)

-- Hauptproblem: is_superadmin_safe Funktion korrigieren
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- OHNE auth.users Zugriff - nur sichere Fallbacks verwenden
  
  -- Fallback 1: Direkte SuperAdmin User-ID (Ihr Account)
  IF user_id::text = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2' THEN
    RETURN TRUE;
  END IF;
  
  -- Fallback 2: Prüfe user_roles Tabelle für superadmin Rolle
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = user_id 
    AND ur.role = 'superadmin'::user_role
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Standard: Kein SuperAdmin
  RETURN FALSE;
EXCEPTION
  WHEN OTHERS THEN
    -- Bei jedem Fehler: Kein SuperAdmin-Zugriff
    RETURN FALSE;
END;
$$;

-- Log der Reparatur
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  auth.uid(), 
  'security_function_repair', 
  'system', 
  'is_superadmin_safe',
  jsonb_build_object(
    'description', 'Kritische Sicherheitsfunktion repariert - auth.users Zugriff entfernt',
    'function_repaired', 'is_superadmin_safe',
    'auth_users_access_removed', true,
    'fallback_mechanisms_active', true,
    'exception_handling_added', true,
    'timestamp', now()
  )
);