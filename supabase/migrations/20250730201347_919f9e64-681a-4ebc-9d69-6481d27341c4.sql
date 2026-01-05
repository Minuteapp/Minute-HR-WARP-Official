-- KRITISCH: Datenleck beheben - RLS-Policies für alle Tabellen reparieren
-- Das ist ein schwerwiegendes Sicherheitsproblem!

-- 1. Companies Tabelle - Grundlegende Firmen-Isolation
DROP POLICY IF EXISTS "Company isolation" ON companies;
CREATE POLICY "Company isolation" ON companies FOR ALL USING (
  CASE 
    -- SuperAdmins im Admin-Modus sehen alle Firmen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    -- Im Tenant-Modus: nur die spezifische Firma sehen
    WHEN is_in_tenant_context() THEN id = get_tenant_company_id_safe()
    -- Normale Benutzer sehen nur ihre eigene Firma
    ELSE id = get_user_company_id(auth.uid())
  END
);

-- 2. Employees Tabelle - KRITISCHE Isolation
DROP POLICY IF EXISTS "Employee Company Isolation" ON employees;
CREATE POLICY "Employee Company Isolation" ON employees FOR ALL USING (
  CASE 
    -- SuperAdmins im Admin-Modus sehen alle Mitarbeiter
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    -- Im Tenant-Modus: nur Mitarbeiter der Tenant-Firma
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    -- Normale Benutzer sehen nur Mitarbeiter ihrer eigenen Firma
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- 3. User_roles Tabelle - verhindert Rollen-Leck
DROP POLICY IF EXISTS "User roles isolation" ON user_roles;
CREATE POLICY "User roles isolation" ON user_roles FOR ALL USING (
  CASE 
    -- SuperAdmins im Admin-Modus sehen alle Rollen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    -- Im Tenant-Modus: nur Rollen der Tenant-Firma
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    -- Normale Benutzer sehen nur Rollen ihrer eigenen Firma
    ELSE (user_id = auth.uid() OR company_id = get_user_company_id(auth.uid()))
  END
);

-- 4. Projects Tabelle - Projekt-Isolation
DROP POLICY IF EXISTS "Project Company Isolation" ON projects;
CREATE POLICY "Project Company Isolation" ON projects FOR ALL USING (
  CASE 
    -- SuperAdmins im Admin-Modus sehen alle Projekte
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    -- Im Tenant-Modus: nur Projekte der Tenant-Firma
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    -- Normale Benutzer sehen nur Projekte ihrer eigenen Firma
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- 5. Tasks Tabelle - Task-Isolation  
DROP POLICY IF EXISTS "Task Company Isolation" ON tasks;
CREATE POLICY "Task Company Isolation" ON tasks FOR ALL USING (
  CASE 
    -- SuperAdmins im Admin-Modus sehen alle Tasks
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    -- Im Tenant-Modus: nur Tasks der Tenant-Firma
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    -- Normale Benutzer sehen nur Tasks ihrer eigenen Firma
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);