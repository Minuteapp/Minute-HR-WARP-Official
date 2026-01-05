-- Phase 1: JWT-Claim-Optimierung - Custom Access Token Hook
-- Diese Funktion erweitert das JWT Token mit company_id und role

-- 1. Funktion für Custom Access Token Hook erstellen
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims jsonb;
  user_company_id uuid;
  user_role text;
  employee_record record;
BEGIN
  -- Extrahiere bestehende Claims
  claims := event->'claims';
  
  -- Hole company_id und role aus der employees Tabelle
  SELECT e.company_id, e.role INTO employee_record
  FROM public.employees e
  WHERE e.auth_id = (event->>'user_id')::uuid
  LIMIT 1;
  
  -- Wenn Employee gefunden, füge Claims hinzu
  IF employee_record.company_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{company_id}', to_jsonb(employee_record.company_id::text));
    claims := jsonb_set(claims, '{user_role}', to_jsonb(COALESCE(employee_record.role, 'employee')));
  ELSE
    -- Prüfe ob es ein SuperAdmin ist (profiles Tabelle)
    SELECT p.role INTO user_role
    FROM public.profiles p
    WHERE p.id = (event->>'user_id')::uuid;
    
    IF user_role = 'super_admin' THEN
      claims := jsonb_set(claims, '{user_role}', '"super_admin"');
      -- SuperAdmin hat keine feste company_id - wird über Impersonation gesetzt
    END IF;
  END IF;
  
  -- Aktualisierte Claims zurückgeben
  event := jsonb_set(event, '{claims}', claims);
  
  RETURN event;
END;
$$;

-- 2. Berechtigungen setzen
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- 3. Revoke von public für Sicherheit
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM anon;

-- 4. Helper-Funktion für RLS-Policies: Liest company_id aus JWT
CREATE OR REPLACE FUNCTION public.get_jwt_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULLIF(auth.jwt() ->> 'company_id', '')::uuid;
$$;

-- 5. Helper-Funktion für RLS-Policies: Liest user_role aus JWT
CREATE OR REPLACE FUNCTION public.get_jwt_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(auth.jwt() ->> 'user_role', 'employee');
$$;

-- 6. Kommentar zur Dokumentation
COMMENT ON FUNCTION public.custom_access_token_hook IS 
'Custom Access Token Hook für JWT-Claim-Optimierung. 
Fügt company_id und user_role zum JWT Token hinzu.
WICHTIG: Muss in Supabase Dashboard unter Authentication > Hooks aktiviert werden!';

COMMENT ON FUNCTION public.get_jwt_company_id IS 
'Helper-Funktion für RLS-Policies. Liest company_id direkt aus JWT-Claims.';

COMMENT ON FUNCTION public.get_jwt_user_role IS 
'Helper-Funktion für RLS-Policies. Liest user_role direkt aus JWT-Claims.';