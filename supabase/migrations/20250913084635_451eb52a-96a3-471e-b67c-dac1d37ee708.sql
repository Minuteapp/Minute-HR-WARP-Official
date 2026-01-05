-- Fix SuperAdmin detection function with explicit user ID check
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Primär: Prüfe metadata in auth.users
  -- Sekundär: Explizite User-ID als Fallback
  -- Tertiär: Prüfe user_roles Tabelle
  SELECT COALESCE(
    (SELECT raw_user_meta_data->>'role' = 'superadmin' FROM auth.users WHERE id = $1),
    ($1::text = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'),
    (SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = $1 AND role = 'superadmin')),
    false
  );
$function$;

-- Verbesserte get_user_company_id Funktion die NULL für SuperAdmins zurückgibt wenn kein Tenant-Kontext gesetzt ist
CREATE OR REPLACE FUNCTION public.get_user_company_id(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  company_uuid uuid;
BEGIN
  -- Wenn SuperAdmin und im Tenant-Modus, verwende Tenant-Company
  IF is_superadmin_safe(user_uuid) AND is_in_tenant_context() THEN
    RETURN get_tenant_company_id_safe();
  END IF;
  
  -- Für normale User: hole company_id aus user_roles
  SELECT ur.company_id INTO company_uuid
  FROM public.user_roles ur
  WHERE ur.user_id = user_uuid
  LIMIT 1;
  
  RETURN company_uuid;
END;
$function$;

-- Repariere auto_assign_company_id um KEINE Daten zu kopieren
CREATE OR REPLACE FUNCTION public.auto_assign_company_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Nur setzen wenn company_id NULL ist UND es ein INSERT ist
  IF NEW.company_id IS NULL AND TG_OP = 'INSERT' THEN
    -- Im Tenant-Kontext: verwende tenant_company_id
    IF is_in_tenant_context() THEN
      NEW.company_id := get_tenant_company_id_safe();
      RAISE NOTICE 'Tenant mode: Auto-assigned company_id % for table %', NEW.company_id, TG_TABLE_NAME;
    ELSE
      -- Für SuperAdmins: KEINE automatische Zuweisung außerhalb des Tenant-Kontexts
      -- Für normale Benutzer: verwende ihre Firma
      IF NOT is_superadmin_safe(auth.uid()) THEN
        NEW.company_id := get_user_company_id(auth.uid());
        RAISE NOTICE 'Normal mode: Auto-assigned company_id % for table %', NEW.company_id, TG_TABLE_NAME;
      END IF;
    END IF;
    
    -- WICHTIG: KEINE Legacy-Daten kopieren!
    -- Neue Firmen starten komplett leer!
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Repariere set_tenant_context Funktion
CREATE OR REPLACE FUNCTION public.set_tenant_context(tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- SuperAdmin-Prüfung mit verbesserter Funktion
  IF NOT is_superadmin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Nur Super-Admins können den Tenant-Kontext wechseln';
  END IF;
  
  -- Prüfe ob die Firma existiert
  IF NOT EXISTS (SELECT 1 FROM public.companies WHERE id = tenant_id AND is_active = true) THEN
    RAISE EXCEPTION 'Firma mit ID % existiert nicht oder ist inaktiv', tenant_id;
  END IF;
  
  -- Update oder erstelle Tenant-Session
  INSERT INTO public.user_tenant_sessions (user_id, tenant_company_id, is_tenant_mode, updated_at)
  VALUES (auth.uid(), tenant_id, true, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    tenant_company_id = tenant_id,
    is_tenant_mode = true,
    updated_at = now();
    
  -- Log für Debugging
  RAISE NOTICE 'Tenant context erfolgreich gesetzt: user_id=%, tenant_id=%', auth.uid(), tenant_id;
END;
$function$;

-- Verbesserte clear_tenant_context Funktion
CREATE OR REPLACE FUNCTION public.clear_tenant_context()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- SuperAdmin-Prüfung mit verbesserter Funktion
  IF NOT is_superadmin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Nur Super-Admins können den Tenant-Kontext löschen';
  END IF;
  
  -- Setze Tenant-Session zurück (nicht löschen, um Tabelle zu erhalten)
  INSERT INTO public.user_tenant_sessions (user_id, tenant_company_id, is_tenant_mode, updated_at)
  VALUES (auth.uid(), NULL, false, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    tenant_company_id = NULL,
    is_tenant_mode = false,
    updated_at = now();
  
  -- Log für Debugging
  RAISE NOTICE 'Tenant context erfolgreich gelöscht für user_id=%', auth.uid();
END;
$function$;

-- Stelle sicher, dass user_tenant_sessions Tabelle existiert
CREATE TABLE IF NOT EXISTS public.user_tenant_sessions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  is_tenant_mode boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS für user_tenant_sessions
ALTER TABLE public.user_tenant_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Nur der eigene User kann seine Sessions verwalten
DROP POLICY IF EXISTS "Users manage own tenant sessions" ON public.user_tenant_sessions;
CREATE POLICY "Users manage own tenant sessions" 
ON public.user_tenant_sessions 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Policy: SuperAdmins können alle Sessions sehen (für Debugging)
DROP POLICY IF EXISTS "SuperAdmins can view all tenant sessions" ON public.user_tenant_sessions;
CREATE POLICY "SuperAdmins can view all tenant sessions" 
ON public.user_tenant_sessions 
FOR SELECT 
USING (is_superadmin_safe(auth.uid()));

-- Test-Funktion für Debugging
CREATE OR REPLACE FUNCTION public.debug_superadmin_status()
RETURNS TABLE(
  current_user_id uuid,
  metadata_role text,
  is_explicit_superadmin boolean,
  user_roles_entry text,
  final_is_superadmin boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY SELECT
    auth.uid() as current_user_id,
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) as metadata_role,
    (auth.uid()::text = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2') as is_explicit_superadmin,
    (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1) as user_roles_entry,
    is_superadmin_safe(auth.uid()) as final_is_superadmin;
END;
$function$;