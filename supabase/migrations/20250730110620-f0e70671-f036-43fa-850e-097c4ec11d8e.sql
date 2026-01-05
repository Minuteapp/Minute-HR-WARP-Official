-- Prüfen der aktuellen RLS-Policies für Datenisolierung im Multi-Tenant-System

-- 1. Policy für employees Tabelle prüfen und verbessern
DROP POLICY IF EXISTS "Employees - Company Isolation" ON public.employees;

CREATE POLICY "Employees - Company Isolation" 
ON public.employees 
FOR ALL 
USING (
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

-- 2. Policy für user_roles Tabelle für bessere Isolation
DROP POLICY IF EXISTS "User Roles - Multi-Tenant Isolation" ON public.user_roles;

CREATE POLICY "User Roles - Multi-Tenant Isolation" 
ON public.user_roles 
FOR ALL 
USING (
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

-- 3. Funktion um zu prüfen ob ein Benutzer SuperAdmin ist und aktuell NICHT im Tenant-Modus
CREATE OR REPLACE FUNCTION public.can_access_all_companies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Nur SuperAdmins im Super-Admin-Modus können auf alle Firmen zugreifen
  RETURN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context();
END;
$function$;

-- 4. Verbesserte Policy für companies Tabelle
DROP POLICY IF EXISTS "Companies - Admin Access" ON public.companies;

CREATE POLICY "Companies - Admin Access" 
ON public.companies 
FOR ALL 
USING (
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
  CASE 
    -- Nur SuperAdmins im Super-Admin-Modus können Firmen erstellen/bearbeiten
    WHEN can_access_all_companies() THEN 
      true
    -- Im Tenant-Modus: Keine neuen Firmen erstellen
    ELSE 
      false
  END
);