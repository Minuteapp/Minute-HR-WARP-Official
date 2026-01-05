-- Phase 3: RLS-Funktionen auf JWT-Claims optimieren
-- Priorisiert JWT-Claims für bessere Performance, mit DB-Fallback für SuperAdmin

-- 1. Optimierte can_access_tenant Funktion mit JWT-Priorität
CREATE OR REPLACE FUNCTION public.can_access_tenant(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- PRIORITÄT 1: JWT-Claim company_id (schnellste Prüfung, kein DB-Zugriff)
    (public.get_jwt_company_id() = p_company_id)
    OR
    -- PRIORITÄT 2: SuperAdmin aus JWT
    (public.get_jwt_user_role() IN ('super_admin', 'superadmin'))
    OR
    -- FALLBACK 3: Active Tenant Session (für SuperAdmin Impersonation)
    EXISTS (
      SELECT 1 FROM active_tenant_sessions 
      WHERE session_user_id = auth.uid() 
        AND impersonated_company_id = p_company_id 
        AND is_active = true
    )
    OR
    -- FALLBACK 4: DB-basierte Prüfung (Legacy/Backup)
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND company_id = p_company_id)
    OR
    EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND company_id = p_company_id)
$$;

-- 2. Optimierte can_write_tenant Funktion mit JWT-Priorität
CREATE OR REPLACE FUNCTION public.can_write_tenant(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- PRIORITÄT 1: JWT-Claim company_id + Rolle mit Schreibrechten
    (
      public.get_jwt_company_id() = p_company_id 
      AND public.get_jwt_user_role() IN ('admin', 'hr_manager', 'manager', 'super_admin', 'superadmin')
    )
    OR
    -- PRIORITÄT 2: SuperAdmin ohne aktive Impersonation (volle Rechte)
    (
      public.get_jwt_user_role() IN ('super_admin', 'superadmin')
      AND NOT EXISTS (
        SELECT 1 FROM active_tenant_sessions 
        WHERE session_user_id = auth.uid() AND is_active = true
      )
    )
    OR
    -- FALLBACK 3: Active Tenant Session mit Schreibrechten
    EXISTS (
      SELECT 1 FROM active_tenant_sessions 
      WHERE session_user_id = auth.uid() 
        AND impersonated_company_id = p_company_id 
        AND is_active = true
        AND can_write = true
    )
    OR
    -- FALLBACK 4: DB-basierte Rollenprüfung (Legacy)
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
        AND company_id = p_company_id 
        AND role IN ('admin', 'hr_manager', 'manager')
    )
$$;

-- 3. Neue Funktion: Schnelle company_id Ermittlung (JWT > DB)
CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    -- PRIORITÄT 1: JWT-Claim
    public.get_jwt_company_id(),
    -- PRIORITÄT 2: Aktive Impersonation-Session
    (SELECT impersonated_company_id FROM active_tenant_sessions 
     WHERE session_user_id = auth.uid() AND is_active = true LIMIT 1),
    -- PRIORITÄT 3: Mitarbeiter-Zuordnung
    (SELECT company_id FROM employees WHERE user_id = auth.uid() LIMIT 1)
  );
$$;

-- 4. Neue Funktion: Prüft ob User berechtigt ist für irgendeine Aktion in der Company
CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.get_jwt_company_id() = p_company_id
    OR
    EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND company_id = p_company_id);
$$;

-- 5. Kommentare für Dokumentation
COMMENT ON FUNCTION public.can_access_tenant IS 
'JWT-optimierte Tenant-Zugriffsprüfung. Priorisiert JWT-Claims für Performance.';

COMMENT ON FUNCTION public.can_write_tenant IS 
'JWT-optimierte Schreibrechte-Prüfung. Priorisiert JWT-Claims für Performance.';

COMMENT ON FUNCTION public.get_effective_company_id IS 
'Ermittelt die effektive company_id aus JWT oder DB-Fallback.';

COMMENT ON FUNCTION public.is_company_member IS 
'Schnelle Prüfung ob User Mitglied einer Company ist (JWT-basiert).';