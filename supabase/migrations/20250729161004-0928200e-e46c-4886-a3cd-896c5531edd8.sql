-- Repariere die Super-Admin-Funktion mit korrektem Spaltenname
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Prüfe sowohl user_roles Tabelle als auch user_metadata
  SELECT COALESCE(
    (SELECT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = $1 AND role = 'superadmin'
    )),
    (SELECT 
      CASE 
        WHEN raw_user_meta_data->>'role' = 'superadmin' THEN true
        ELSE false
      END
      FROM auth.users 
      WHERE id = $1
    ),
    false
  );
$function$;

-- Erstelle eine bessere get_user_company_id Funktion falls sie fehlt
CREATE OR REPLACE FUNCTION public.get_user_company_id(user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  company_id UUID;
BEGIN
  -- Versuche company_id über user_roles zu finden
  SELECT ur.company_id INTO company_id
  FROM public.user_roles ur
  WHERE ur.user_id = $1
  LIMIT 1;
  
  -- Falls nichts gefunden, versuche über employees
  IF company_id IS NULL THEN
    SELECT e.company_id INTO company_id
    FROM public.employees e
    WHERE e.id = $1
    LIMIT 1;
  END IF;
  
  RETURN company_id;
END;
$function$;

-- Aktualisiere die set_tenant_context Funktion für bessere Debugging
CREATE OR REPLACE FUNCTION public.set_tenant_context(p_company_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_company_exists BOOLEAN;
  v_user_id UUID;
BEGIN
  -- Aktuellen Benutzer holen
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Benutzer nicht authentifiziert'
    );
  END IF;
  
  -- Prüfen ob die Firma existiert
  SELECT EXISTS (
    SELECT 1 FROM companies WHERE id = p_company_id AND is_active = true
  ) INTO v_company_exists;
  
  IF NOT v_company_exists THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Firma nicht gefunden oder nicht aktiv'
    );
  END IF;
  
  -- Tenant-Session setzen oder aktualisieren
  INSERT INTO user_tenant_sessions (user_id, tenant_company_id, is_tenant_mode)
  VALUES (v_user_id, p_company_id, true)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    tenant_company_id = p_company_id,
    is_tenant_mode = true,
    updated_at = now();
  
  -- Debug-Log
  INSERT INTO public.debug_logs (message, data) 
  VALUES ('tenant_context_set', jsonb_build_object(
    'user_id', v_user_id,
    'company_id', p_company_id,
    'success', true
  )) ON CONFLICT DO NOTHING;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Tenant-Kontext erfolgreich gesetzt',
    'tenant_company_id', p_company_id
  );
END;
$function$;