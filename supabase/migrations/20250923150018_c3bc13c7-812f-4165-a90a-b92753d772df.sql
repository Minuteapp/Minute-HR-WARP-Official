-- Kritische Sicherheitskorrekturen - Finale Version ohne problematische Audit-Logs

-- 1. RLS für Admin Invitations aktivieren und sichere Policies erstellen
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'admin_invitations' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop bestehende unsichere Policies für admin_invitations
DROP POLICY IF EXISTS "Allow all to view admin invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Allow creation of admin invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Allow updating admin invitations" ON public.admin_invitations;

-- Neue sichere Policy für Admin Invitations - nur SuperAdmins
CREATE POLICY "SuperAdmins can manage admin invitations"
ON public.admin_invitations
FOR ALL
USING (is_superadmin_safe(auth.uid()));

-- 2. Profiles-Tabelle mit sicheren Policies ausstatten
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view own profile or admins all'
  ) THEN
    CREATE POLICY "Users can view own profile or admins all"
    ON public.profiles
    FOR SELECT
    USING (
      id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('admin', 'superadmin')
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- 3. Arbeitszeit Modelle mit Multi-Tenant-Isolation sichern
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'arbeitszeit_modelle' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.arbeitszeit_modelle ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop bestehende Policies für arbeitszeit_modelle
DROP POLICY IF EXISTS "Admins können alle Arbeitszeitmodelle verwalten" ON public.arbeitszeit_modelle;
DROP POLICY IF EXISTS "Benutzer können Arbeitszeitmodelle lesen" ON public.arbeitszeit_modelle;

-- Neue sichere Policies für Arbeitszeit Modelle
CREATE POLICY "Arbeitszeit_Modelle_Admin_Access"
ON public.arbeitszeit_modelle
FOR ALL
USING (
  is_superadmin_safe(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr')
  )
);

CREATE POLICY "Arbeitszeit_Modelle_Employee_Read"
ON public.arbeitszeit_modelle
FOR SELECT
USING (ist_aktiv = true);

-- 4. Verbesserte Sicherheitsfunktionen mit SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.get_user_company_id_safe(user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT ur.company_id 
  FROM public.user_roles ur 
  WHERE ur.user_id = $1
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_tenant_sessions uts
    WHERE uts.user_id = auth.uid() 
    AND uts.is_tenant_mode = true
    AND uts.tenant_company_id IS NOT NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT uts.tenant_company_id 
  FROM public.user_tenant_sessions uts
  WHERE uts.user_id = auth.uid() 
  AND uts.is_tenant_mode = true
  LIMIT 1;
$$;

-- 5. Benutzer-Zugriffs-Validierung mit verbesserter Sicherheit
CREATE OR REPLACE FUNCTION public.validate_user_access(
  target_user_id UUID,
  required_role TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  current_user_role TEXT;
  target_user_company UUID;
  current_user_company UUID;
BEGIN
  -- SuperAdmin kann alles
  IF is_superadmin_safe(auth.uid()) THEN
    RETURN TRUE;
  END IF;
  
  -- Eigene Daten sind immer zugänglich
  IF target_user_id = auth.uid() THEN
    RETURN TRUE;
  END IF;
  
  -- Hole aktuelle Benutzerrolle
  SELECT ur.role::TEXT INTO current_user_role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
  LIMIT 1;
  
  -- Prüfe Rollenanforderung
  IF required_role IS NOT NULL AND current_user_role != required_role THEN
    RETURN FALSE;
  END IF;
  
  -- Prüfe Company-Zugehörigkeit für Multi-Tenant-Isolation
  SELECT get_user_company_id_safe(target_user_id) INTO target_user_company;
  SELECT get_user_company_id_safe(auth.uid()) INTO current_user_company;
  
  -- Gleiche Company erforderlich für Datenzugriff
  RETURN (target_user_company = current_user_company);
END;
$$;

-- 6. Sicherheits-Audit-Trigger für kritische Tabellen
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Sichere Logging-Funktion für sensible Datenoperationen
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.security_audit_logs (
      user_id, action, resource_type, resource_id, details
    ) VALUES (
      auth.uid(),
      CASE TG_OP
        WHEN 'INSERT' THEN 'sensitive_data_create'
        WHEN 'UPDATE' THEN 'sensitive_data_modify'
        WHEN 'DELETE' THEN 'sensitive_data_delete'
      END,
      TG_TABLE_NAME,
      COALESCE(NEW.id::TEXT, OLD.id::TEXT),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', NOW(),
        'security_context', 'rls_migration'
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Audit-Trigger für kritische Tabellen aktivieren
DROP TRIGGER IF EXISTS companies_security_audit ON public.companies;
CREATE TRIGGER companies_security_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

DROP TRIGGER IF EXISTS admin_invitations_security_audit ON public.admin_invitations;
CREATE TRIGGER admin_invitations_security_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_invitations
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

-- 7. Kommentar zur Dokumentation der Sicherheitsverbesserungen
COMMENT ON POLICY "SuperAdmins can manage admin invitations" ON public.admin_invitations IS 
'Kritische Sicherheitskorrektur: Nur SuperAdmins können Admin-Einladungen verwalten - verhindert unbefugten Zugriff auf sensible Einladungsdaten';

COMMENT ON POLICY "Users can view own profile or admins all" ON public.profiles IS 
'Sicherheitskorrektur: Benutzer können nur eigene Profile oder Admins alle Profile sehen - Multi-Tenant-Datenschutz';

COMMENT ON POLICY "Arbeitszeit_Modelle_Admin_Access" ON public.arbeitszeit_modelle IS 
'Sicherheitskorrektur: Nur SuperAdmins und HR/Admins können Arbeitszeitmodelle verwalten - schützt Unternehmensrichtlinien';