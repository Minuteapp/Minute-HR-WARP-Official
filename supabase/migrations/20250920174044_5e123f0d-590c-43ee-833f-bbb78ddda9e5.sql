-- Korrigiere die SuperAdmin-Erkennung und teste das System

-- Korrigiere is_superadmin_safe Funktion
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Primär: Prüfe metadata in auth.users
  -- Sekundär: Explizite User-ID als Fallback  
  -- Tertiär: Prüfe user_roles Tabelle
  SELECT COALESCE(
    (SELECT raw_user_meta_data->>'role' = 'superadmin' FROM auth.users WHERE id = $1),
    ($1::text = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::text),
    (SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = $1 AND role = 'superadmin')),
    false
  );
$$;

-- Debug-Funktion um User-Daten zu prüfen
CREATE OR REPLACE FUNCTION public.debug_user_context()
RETURNS TABLE(
  current_user_id uuid,
  user_metadata jsonb,
  is_super_admin boolean,
  is_in_tenant_mode boolean,
  tenant_company_id uuid,
  user_roles_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY SELECT
    auth.uid() as current_user_id,
    (SELECT raw_user_meta_data FROM auth.users WHERE id = auth.uid()) as user_metadata,
    is_superadmin_safe(auth.uid()) as is_super_admin,
    is_in_tenant_context() as is_in_tenant_mode,
    get_tenant_company_id_safe() as tenant_company_id,
    (SELECT jsonb_agg(jsonb_build_object('role', role, 'company_id', company_id)) 
     FROM user_roles WHERE user_id = auth.uid()) as user_roles_data;
END;
$$;