-- KRITISCHER SECURITY FIX: Tenant-Isolation für alle wichtigen Tabellen

-- 1. Employees Tabelle - strenge Tenant-Isolation
DROP POLICY IF EXISTS "Employee Company Isolation" ON public.employees;
CREATE POLICY "Employee Company Isolation" ON public.employees
FOR ALL USING (
  CASE
    -- SuperAdmin im Tenant-Modus: Nur Daten der Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- SuperAdmin ohne Tenant-Modus: Alle Daten
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer: Nur eigene Firma
    ELSE 
      company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- 2. Companies Tabelle - SuperAdmin kann nur Tenant-Firma sehen im Tenant-Modus  
DROP POLICY IF EXISTS "Company SuperAdmin Tenant Isolation" ON public.companies;
CREATE POLICY "Company SuperAdmin Tenant Isolation" ON public.companies
FOR ALL USING (
  CASE
    -- SuperAdmin im Tenant-Modus: Nur die Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      id = get_tenant_company_id_safe()
    -- SuperAdmin ohne Tenant-Modus: Alle Firmen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer: Nur eigene Firma
    ELSE 
      id = get_user_company_id(auth.uid()) AND id IS NOT NULL
  END
);

-- 3. Time Entries - strenge Tenant-Isolation
DROP POLICY IF EXISTS "Time Entry Tenant Isolation" ON public.time_entries;
CREATE POLICY "Time Entry Tenant Isolation" ON public.time_entries
FOR ALL USING (
  CASE
    -- SuperAdmin im Tenant-Modus: Nur Einträge der Tenant-Firma-Mitarbeiter
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = time_entries.user_id 
        AND e.company_id = get_tenant_company_id_safe()
      )
    -- SuperAdmin ohne Tenant-Modus: Alle Einträge
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer: Nur eigene Einträge oder Einträge der eigenen Firma
    ELSE 
      user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = time_entries.user_id 
        AND e.company_id = get_user_company_id(auth.uid())
      )
  END
);

-- 4. User Roles - kritische Tenant-Isolation
DROP POLICY IF EXISTS "User Roles Tenant Isolation" ON public.user_roles;
CREATE POLICY "User Roles Tenant Isolation" ON public.user_roles
FOR ALL USING (
  CASE
    -- SuperAdmin im Tenant-Modus: Nur Rollen der Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- SuperAdmin ohne Tenant-Modus: Alle Rollen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer: Nur eigene Rolle oder Rollen der eigenen Firma
    ELSE 
      user_id = auth.uid() OR (
        company_id = get_user_company_id(auth.uid()) AND 
        company_id IS NOT NULL AND
        EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr'))
      )
  END
);

-- 5. Projects - Tenant-Isolation
DROP POLICY IF EXISTS "Projects Tenant Isolation" ON public.projects;  
CREATE POLICY "Projects Tenant Isolation" ON public.projects
FOR ALL USING (
  CASE
    -- SuperAdmin im Tenant-Modus: Nur Projekte der Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- SuperAdmin ohne Tenant-Modus: Alle Projekte
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer: Nur Projekte der eigenen Firma
    ELSE 
      company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- 6. Tasks - Tenant-Isolation über Projekte
DROP POLICY IF EXISTS "Tasks Tenant Isolation" ON public.tasks;
CREATE POLICY "Tasks Tenant Isolation" ON public.tasks  
FOR ALL USING (
  CASE
    -- SuperAdmin im Tenant-Modus: Nur Tasks von Projekten der Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = tasks.project_id 
        AND p.company_id = get_tenant_company_id_safe()
      ) OR project_id IS NULL
    -- SuperAdmin ohne Tenant-Modus: Alle Tasks
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer: Eigene Tasks oder Tasks der eigenen Firma
    ELSE 
      assigned_to = auth.uid() OR created_by = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = tasks.project_id 
        AND p.company_id = get_user_company_id(auth.uid())
      )
  END
);

-- 7. Debug-Funktion aktualisieren für bessere Tenant-Context-Prüfung
CREATE OR REPLACE FUNCTION public.debug_tenant_context_detailed()
RETURNS TABLE(
  current_user_id uuid, 
  is_super_admin boolean, 
  is_in_tenant_mode boolean, 
  tenant_company_id uuid, 
  user_company_id uuid,
  tenant_session_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT
    auth.uid() as current_user_id,
    is_superadmin_safe(auth.uid()) as is_super_admin,
    is_in_tenant_context() as is_in_tenant_mode,
    get_tenant_company_id_safe() as tenant_company_id,
    get_user_company_id(auth.uid()) as user_company_id,
    (SELECT to_jsonb(uts.*) FROM user_tenant_sessions uts WHERE uts.user_id = auth.uid() ORDER BY updated_at DESC LIMIT 1) as tenant_session_details;
END;
$$;