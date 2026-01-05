-- Aktualisiere die RLS-Policies um die neuen Funktionen zu verwenden

-- Employee Policy mit Session-Context
DROP POLICY IF EXISTS "Employee Company Isolation - SELECT" ON employees;
CREATE POLICY "Employee Company Isolation - SELECT" 
ON employees FOR SELECT 
USING (
  -- ECHTER Super-Admin-Kontext: sieht alle
  is_in_superadmin_context() OR
  -- Tenant-Modus: NUR Company-spezifische Daten
  (company_id = get_current_tenant_company_id() AND company_id IS NOT NULL)
);

-- Task Policy mit Session-Context
DROP POLICY IF EXISTS "Task Company Isolation - SELECT" ON tasks;
CREATE POLICY "Task Company Isolation - SELECT" 
ON tasks FOR SELECT 
USING (
  -- ECHTER Super-Admin-Kontext: sieht alle
  is_in_superadmin_context() OR
  -- Tenant-Modus: NUR Company-spezifische Daten
  (company_id = get_current_tenant_company_id() AND company_id IS NOT NULL)
);

-- Project Policy mit Session-Context
DROP POLICY IF EXISTS "Project Company Isolation - SELECT" ON projects;
CREATE POLICY "Project Company Isolation - SELECT" 
ON projects FOR SELECT 
USING (
  -- ECHTER Super-Admin-Kontext: sieht alle
  is_in_superadmin_context() OR
  -- Tenant-Modus: NUR Company-spezifische Daten
  (company_id = get_current_tenant_company_id() AND company_id IS NOT NULL)
);

-- Goal Policy mit Session-Context
DROP POLICY IF EXISTS "Goal Company Isolation - SELECT" ON goals;
CREATE POLICY "Goal Company Isolation - SELECT" 
ON goals FOR SELECT 
USING (
  -- ECHTER Super-Admin-Kontext: sieht alle
  is_in_superadmin_context() OR
  -- Tenant-Modus: NUR Company-spezifische Daten
  (company_id = get_current_tenant_company_id() AND company_id IS NOT NULL)
);