-- Fix custom_access_token_hook: auth_id -> user_id

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
  -- FIX: user_id statt auth_id verwenden
  SELECT e.company_id, e.role INTO employee_record
  FROM public.employees e
  WHERE e.user_id = (event->>'user_id')::uuid
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

-- Grant wieder setzen (notwendig nach CREATE OR REPLACE)
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM anon;