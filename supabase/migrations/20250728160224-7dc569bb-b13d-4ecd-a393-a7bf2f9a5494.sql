-- KRITISCHE KORREKTUR: STRIKTE DATENISOLATION FÜR EMPLOYEES

-- Korrigiere die Employee RLS Policy für strikte Tenant-Isolation
DROP POLICY IF EXISTS "Employees Company Isolation" ON employees;
CREATE POLICY "Employees Company Isolation" ON employees  
FOR ALL USING (
    -- Im Tenant-Kontext: NIEMALS alle Daten zeigen, nur Tenant-Firmendaten
    (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
    OR
    -- Nur außerhalb Tenant-Kontext: SuperAdmins sehen alles
    (NOT is_in_tenant_context() AND is_superadmin_safe(auth.uid()))
    OR
    -- Normale Benutzer: nur ihre Firmendaten
    (NOT is_in_tenant_context() AND company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- Auch für Tasks, Projects und andere Tabellen korrigieren
DROP POLICY IF EXISTS "Tasks Company Isolation" ON tasks;
CREATE POLICY "Tasks Company Isolation" ON tasks
FOR ALL USING (
    -- Im Tenant-Kontext: NUR Tenant-Firmendaten
    (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
    OR
    -- Nur außerhalb Tenant-Kontext: SuperAdmins sehen alles
    (NOT is_in_tenant_context() AND is_superadmin_safe(auth.uid()))
    OR
    -- Normale Benutzer: nur ihre Firmendaten
    (NOT is_in_tenant_context() AND company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

DROP POLICY IF EXISTS "Projects Company Isolation" ON projects;
CREATE POLICY "Projects Company Isolation" ON projects
FOR ALL USING (
    -- Im Tenant-Kontext: NUR Tenant-Firmendaten
    (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
    OR
    -- Nur außerhalb Tenant-Kontext: SuperAdmins sehen alles
    (NOT is_in_tenant_context() AND is_superadmin_safe(auth.uid()))
    OR
    -- Normale Benutzer: nur ihre Firmendaten + Projektmitgliedschaft
    (NOT is_in_tenant_context() AND company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL AND (
        owner_id = auth.uid() OR 
        auth.uid()::text = ANY(team_members::text[])
    ))
);