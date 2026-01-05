-- SOFORTIGER FIX: RLS Policies korrekt für NULL company_id
-- Das Problem: get_user_company_id() gibt NULL zurück, und NULL = NULL ist immer false in SQL

-- 1. Korrigiere RLS für TASKS
DROP POLICY IF EXISTS "Company Isolation for Tasks" ON tasks;

CREATE POLICY "Company Isolation for Tasks" ON tasks
  FOR ALL 
  USING (
    -- Super-Admin kann alles sehen
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Tasks der aktuellen Tenant-Firma
    (is_in_tenant_context() AND EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = auth.uid() 
      AND e.company_id = get_tenant_company_id_safe()
    ))
    OR
    -- Normale Benutzer: NUR wenn sie eine company_id haben UND diese übereinstimmt
    (NOT is_in_tenant_context() AND 
     get_user_company_id(auth.uid()) IS NOT NULL AND 
     company_id = get_user_company_id(auth.uid())
    )
    OR
    -- ODER sie sind Ersteller/Zugewiesener der Task
    (NOT is_in_tenant_context() AND (
      (assigned_to IS NOT NULL AND auth.uid() = ANY(assigned_to))
      OR created_by = auth.uid()
    ))
  );

-- 2. Korrigiere RLS für PROJECTS
DROP POLICY IF EXISTS "Company Isolation for Projects" ON projects;

CREATE POLICY "Company Isolation for Projects" ON projects
  FOR ALL 
  USING (
    -- Super-Admin kann alles sehen
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Projekte der Tenant-Firma
    (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
    OR
    -- Normale Benutzer: NUR wenn sie eine company_id haben UND diese übereinstimmt
    (NOT is_in_tenant_context() AND 
     get_user_company_id(auth.uid()) IS NOT NULL AND 
     company_id = get_user_company_id(auth.uid())
    )
    OR
    -- ODER sie sind Owner/Team-Mitglied
    (NOT is_in_tenant_context() AND (
      owner_id = auth.uid() 
      OR (team_members IS NOT NULL AND auth.uid() = ANY(team_members))
    ))
  );

-- 3. Korrigiere RLS für EMPLOYEES
DROP POLICY IF EXISTS "Company Isolation for Employees" ON employees;

CREATE POLICY "Company Isolation for Employees" ON employees
  FOR ALL 
  USING (
    -- Super-Admin kann alles sehen
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Mitarbeiter der Tenant-Firma
    (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
    OR
    -- Normale Benutzer: NUR wenn sie eine company_id haben UND diese übereinstimmt
    (NOT is_in_tenant_context() AND 
     get_user_company_id(auth.uid()) IS NOT NULL AND 
     company_id = get_user_company_id(auth.uid())
    )
    OR
    -- ODER sie sind der Employee selbst
    (NOT is_in_tenant_context() AND id = auth.uid())
  );

-- 4. Korrigiere RLS für GOALS
DROP POLICY IF EXISTS "Company Isolation for Goals" ON goals;

CREATE POLICY "Company Isolation for Goals" ON goals
  FOR ALL 
  USING (
    -- Super-Admin kann alles sehen
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Goals der Tenant-Firma
    (is_in_tenant_context() AND 
     get_tenant_company_id_safe() IS NOT NULL AND
     company_id = get_tenant_company_id_safe()
    )
    OR
    -- Normale Benutzer: NUR wenn sie eine company_id haben UND diese übereinstimmt
    (NOT is_in_tenant_context() AND 
     get_user_company_id(auth.uid()) IS NOT NULL AND 
     company_id = get_user_company_id(auth.uid())
    )
    OR
    -- ODER sie sind Ersteller/Zugewiesener
    (NOT is_in_tenant_context() AND (
      created_by = auth.uid()
      OR assigned_to = auth.uid()
      OR user_id = auth.uid()
    ))
  );

-- 5. Erstelle STRENGE Isolation für ALLE anderen Tabellen - OHNE Legacy-Zugriff
DROP POLICY IF EXISTS "Company Isolation for Time Entries" ON time_entries;

CREATE POLICY "Company Isolation for Time Entries" ON time_entries
  FOR ALL 
  USING (
    -- Super-Admin kann alles sehen
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Time Entries von Mitarbeitern der Tenant-Firma
    (is_in_tenant_context() AND user_id IN (
      SELECT e.id FROM employees e 
      WHERE e.company_id = get_tenant_company_id_safe()
    ))
    OR
    -- Normale Benutzer: NUR eigene Einträge
    (NOT is_in_tenant_context() AND user_id = auth.uid())
  );