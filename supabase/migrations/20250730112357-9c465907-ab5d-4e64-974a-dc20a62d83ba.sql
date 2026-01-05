-- KRITISCHER SICHERHEITSFIX: Verhindere Datenleck bei nicht-authentifizierten Benutzern

-- 1. Sichere RLS Policy für employees - KEINE Daten für nicht-authentifizierte Benutzer
DROP POLICY IF EXISTS "Employees - Company Isolation" ON public.employees;

CREATE POLICY "Employees - Company Isolation" 
ON public.employees 
FOR ALL 
USING (
  -- Zunächst prüfen ob Benutzer authentifiziert ist
  auth.uid() IS NOT NULL AND
  CASE 
    -- Im Tenant-Modus: Nur Mitarbeiter der aktuellen Tenant-Firma anzeigen
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- SuperAdmin im Super-Admin-Modus: Alle Mitarbeiter sehen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer: Nur Mitarbeiter ihrer eigenen Firma
    ELSE 
      company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
)
WITH CHECK (
  -- Auch für INSERT/UPDATE: Authentifizierung erforderlich
  auth.uid() IS NOT NULL AND
  CASE 
    -- Im Tenant-Modus: Neue Mitarbeiter werden automatisch der Tenant-Firma zugeordnet
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- SuperAdmin kann Mitarbeiter für jede Firma erstellen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer können nur für ihre eigene Firma Mitarbeiter erstellen
    ELSE 
      company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- 2. Sichere RLS Policy für companies - KEINE Daten für nicht-authentifizierte Benutzer
DROP POLICY IF EXISTS "Companies - Admin Access" ON public.companies;

CREATE POLICY "Companies - Admin Access" 
ON public.companies 
FOR ALL 
USING (
  -- Authentifizierung ist PFLICHT
  auth.uid() IS NOT NULL AND
  CASE 
    -- Im Tenant-Modus: Nur die aktuelle Tenant-Firma sehen
    WHEN is_in_tenant_context() THEN 
      id = get_tenant_company_id_safe()
    -- SuperAdmin im Super-Admin-Modus: Alle Firmen sehen
    WHEN can_access_all_companies() THEN 
      true
    -- Normale Benutzer: Nur ihre eigene Firma
    ELSE 
      id = get_user_company_id(auth.uid())
  END
)
WITH CHECK (
  -- Authentifizierung für CREATE/UPDATE erforderlich
  auth.uid() IS NOT NULL AND
  CASE 
    -- Nur SuperAdmins im Super-Admin-Modus können Firmen erstellen/bearbeiten
    WHEN can_access_all_companies() THEN 
      true
    -- Im Tenant-Modus: Keine neuen Firmen erstellen
    ELSE 
      false
  END
);

-- 3. Sicherer Default für alle anderen Tabellen ohne explizite Company-Isolation
-- user_roles Policy mit Authentifizierungspflicht
DROP POLICY IF EXISTS "User Roles - Multi-Tenant Isolation" ON public.user_roles;

CREATE POLICY "User Roles - Multi-Tenant Isolation" 
ON public.user_roles 
FOR ALL 
USING (
  -- PFLICHT: Benutzer muss authentifiziert sein
  auth.uid() IS NOT NULL AND
  CASE 
    -- Im Tenant-Modus: Nur Rollen von Benutzern der aktuellen Tenant-Firma anzeigen
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- SuperAdmin im Super-Admin-Modus: Alle Rollen sehen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer: Nur ihre eigene Rolle und Rollen ihrer Firma-Kollegen
    ELSE 
      (user_id = auth.uid()) OR 
      (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
  END
)
WITH CHECK (
  -- Authentifizierung für CREATE/UPDATE erforderlich
  auth.uid() IS NOT NULL AND
  CASE 
    -- Im Tenant-Modus: Neue Rollen werden der Tenant-Firma zugeordnet
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- SuperAdmin kann Rollen für alle Firmen setzen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer können nur Rollen in ihrer eigenen Firma verwalten
    ELSE 
      company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);