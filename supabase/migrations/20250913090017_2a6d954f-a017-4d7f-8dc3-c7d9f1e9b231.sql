-- Erstelle eine verbesserte Funktion die explizit die User-ID überprüft
CREATE OR REPLACE FUNCTION public.set_tenant_context_with_user_id(tenant_id uuid, user_id_param uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  effective_user_id uuid;
BEGIN
  -- Verwende übergebene user_id oder fallback auf auth.uid()
  effective_user_id := COALESCE(user_id_param, auth.uid());
  
  -- Debug-Ausgabe
  RAISE NOTICE 'set_tenant_context_with_user_id: user_id=%, tenant_id=%', effective_user_id, tenant_id;
  
  -- Prüfe ob User existiert und SuperAdmin ist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = effective_user_id 
    AND (
      raw_user_meta_data->>'role' = 'superadmin'
      OR id::text = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'
    )
  ) THEN
    RAISE EXCEPTION 'Nur Super-Admins können den Tenant-Kontext wechseln. User ID: %', effective_user_id;
  END IF;
  
  -- Prüfe ob die Firma existiert
  IF NOT EXISTS (SELECT 1 FROM public.companies WHERE id = tenant_id AND is_active = true) THEN
    RAISE EXCEPTION 'Firma mit ID % existiert nicht oder ist inaktiv', tenant_id;
  END IF;
  
  -- Update oder erstelle Tenant-Session
  INSERT INTO public.user_tenant_sessions (user_id, tenant_company_id, is_tenant_mode, updated_at)
  VALUES (effective_user_id, tenant_id, true, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    tenant_company_id = tenant_id,
    is_tenant_mode = true,
    updated_at = now();
    
  -- Log für Debugging
  RAISE NOTICE 'Tenant context erfolgreich gesetzt: user_id=%, tenant_id=%', effective_user_id, tenant_id;
END;
$function$;

-- Aktualisiere die alte Funktion zur Kompatibilität
CREATE OR REPLACE FUNCTION public.set_tenant_context(tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Rufe die neue Funktion auf mit expliziter User-ID falls auth.uid() null ist
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Benutzer nicht authentifiziert';
  END IF;
  
  PERFORM set_tenant_context_with_user_id(tenant_id, auth.uid());
END;
$function$;

-- Verbessere clear_tenant_context genauso
CREATE OR REPLACE FUNCTION public.clear_tenant_context_with_user_id(user_id_param uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  effective_user_id uuid;
BEGIN
  -- Verwende übergebene user_id oder fallback auf auth.uid()
  effective_user_id := COALESCE(user_id_param, auth.uid());
  
  -- Prüfe SuperAdmin-Status
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = effective_user_id 
    AND (
      raw_user_meta_data->>'role' = 'superadmin'
      OR id::text = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'
    )
  ) THEN
    RAISE EXCEPTION 'Nur Super-Admins können den Tenant-Kontext löschen';
  END IF;
  
  -- Setze Tenant-Session zurück
  INSERT INTO public.user_tenant_sessions (user_id, tenant_company_id, is_tenant_mode, updated_at)
  VALUES (effective_user_id, NULL, false, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    tenant_company_id = NULL,
    is_tenant_mode = false,
    updated_at = now();
  
  -- Log für Debugging
  RAISE NOTICE 'Tenant context erfolgreich gelöscht für user_id=%', effective_user_id;
END;
$function$;