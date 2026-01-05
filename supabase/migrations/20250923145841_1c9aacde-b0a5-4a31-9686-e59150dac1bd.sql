-- Kritische Sicherheitskorrekturen - Korrigierte RLS-Policy-Implementierung

-- 1. RLS für Admin Invitations aktivieren (falls noch nicht aktiviert)
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

-- Drop bestehende Policies für admin_invitations falls vorhanden
DROP POLICY IF EXISTS "Allow all to view admin invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Allow creation of admin invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Allow updating admin invitations" ON public.admin_invitations;

-- Neue sichere Policy für Admin Invitations
CREATE POLICY "SuperAdmins can manage admin invitations"
ON public.admin_invitations
FOR ALL
USING (is_superadmin_safe(auth.uid()));

-- 2. Profiles-Tabelle sichern (RLS sollte bereits aktiviert sein)
-- Neue Policies für Profiles hinzufügen (falls noch nicht vorhanden)
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

-- 3. Arbeitszeit Modelle sichern
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

-- 4. Verbesserte Sicherheitsfunktionen (nur wenn noch nicht vorhanden)
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

-- 5. Validierungsfunktion für Benutzer-Zugriff
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
  -- Hole aktuelle Benutzerrolle
  SELECT ur.role::TEXT INTO current_user_role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
  LIMIT 1;
  
  -- SuperAdmin kann alles
  IF is_superadmin_safe(auth.uid()) THEN
    RETURN TRUE;
  END IF;
  
  -- Eigene Daten sind immer zugänglich
  IF target_user_id = auth.uid() THEN
    RETURN TRUE;
  END IF;
  
  -- Prüfe Rollenanforderung
  IF required_role IS NOT NULL AND current_user_role != required_role THEN
    RETURN FALSE;
  END IF;
  
  -- Prüfe Company-Zugehörigkeit
  SELECT get_user_company_id_safe(target_user_id) INTO target_user_company;
  SELECT get_user_company_id_safe(auth.uid()) INTO current_user_company;
  
  -- Gleiche Company erforderlich
  RETURN (target_user_company = current_user_company);
END;
$$;

-- 6. Sicherheits-Audit-Logging
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Log bei Zugriff auf sensible Daten
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
      'timestamp', NOW()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger für sensible Tabellen (nur wenn noch nicht vorhanden)
DROP TRIGGER IF EXISTS companies_security_audit ON public.companies;
CREATE TRIGGER companies_security_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

DROP TRIGGER IF EXISTS admin_invitations_security_audit ON public.admin_invitations;
CREATE TRIGGER admin_invitations_security_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_invitations
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

-- 7. Sicherheits-Audit-Eintrag
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  'security_policy_update',
  'database_security',
  'comprehensive_rls_fixes',
  jsonb_build_object(
    'action_type', 'critical_security_fixes_v2',
    'tables_secured', ARRAY['admin_invitations', 'profiles', 'arbeitszeit_modelle'],
    'security_improvements', ARRAY['rls_enabled', 'admin_access_control', 'audit_logging'],
    'functions_updated', ARRAY['get_user_company_id_safe', 'validate_user_access', 'log_sensitive_access']
  ),
  'high'
);