-- Überprüfe und korrigiere RLS für employees Tabelle
DROP POLICY IF EXISTS "employees_company_isolation" ON employees;

-- Neue konsistente Employee RLS Policy
CREATE POLICY "employees_company_isolation" 
ON employees FOR ALL 
USING (
  CASE
    -- SuperAdmin im Admin-Modus: alle Mitarbeiter sehen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    -- SuperAdmin im Tenant-Modus: nur Mitarbeiter der Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- Normale User: nur Mitarbeiter ihrer eigenen Firma
    ELSE company_id = get_user_company_id(auth.uid())
  END
)
WITH CHECK (
  CASE
    -- SuperAdmin im Admin-Modus: alle Mitarbeiter erstellen/bearbeiten
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    -- SuperAdmin im Tenant-Modus: nur Mitarbeiter der Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- Normale User: nur Mitarbeiter ihrer eigenen Firma
    ELSE company_id = get_user_company_id(auth.uid())
  END
);

-- Prüfe ob RLS-Funktionen existieren, erstelle Fallbacks falls nötig
DO $$
BEGIN
  -- Stelle sicher, dass is_in_tenant_context() existiert
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_in_tenant_context') THEN
    CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
    RETURNS boolean
    LANGUAGE sql
    STABLE SECURITY DEFINER
    SET search_path = public
    AS $function$
      SELECT EXISTS (
        SELECT 1 FROM user_tenant_sessions uts
        WHERE uts.user_id = auth.uid() 
        AND uts.is_tenant_mode = true
        AND uts.tenant_company_id IS NOT NULL
      );
    $function$;
  END IF;

  -- Stelle sicher, dass get_tenant_company_id_safe() existiert
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_tenant_company_id_safe') THEN
    CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
    RETURNS uuid
    LANGUAGE sql
    STABLE SECURITY DEFINER
    SET search_path = public
    AS $function$
      SELECT uts.tenant_company_id
      FROM user_tenant_sessions uts
      WHERE uts.user_id = auth.uid() 
      AND uts.is_tenant_mode = true
      AND uts.tenant_company_id IS NOT NULL
      LIMIT 1;
    $function$;
  END IF;

  -- Stelle sicher, dass get_user_company_id() existiert
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_company_id') THEN
    CREATE OR REPLACE FUNCTION public.get_user_company_id(user_id uuid)
    RETURNS uuid
    LANGUAGE sql
    STABLE SECURITY DEFINER
    SET search_path = public
    AS $function$
      SELECT ur.company_id
      FROM user_roles ur
      WHERE ur.user_id = $1
      LIMIT 1;
    $function$;
  END IF;
END
$$;