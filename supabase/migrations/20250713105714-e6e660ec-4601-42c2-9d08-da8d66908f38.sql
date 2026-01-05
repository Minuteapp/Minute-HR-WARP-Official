-- VERSCHÄRFUNG der RLS-Policies - KEINE Fallbacks im Tenant-Modus!

-- Employee Policies - NUR company_id basiert
DROP POLICY IF EXISTS "Employee Company Isolation - SELECT" ON employees;
CREATE POLICY "Employee Company Isolation - SELECT" 
ON employees FOR SELECT 
USING (
  -- Superadmin sieht alle
  is_superadmin(auth.uid()) OR
  -- STRIKT: Nur Employees der eigenen Company (KEINE Fallbacks!)
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- Task Policies - NUR company_id basiert  
DROP POLICY IF EXISTS "Task Company Isolation - SELECT" ON tasks;
CREATE POLICY "Task Company Isolation - SELECT" 
ON tasks FOR SELECT 
USING (
  -- Superadmin sieht alle
  is_superadmin(auth.uid()) OR
  -- STRIKT: Nur Tasks der eigenen Company (KEINE Fallbacks für created_by!)
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- Project Policies - NUR company_id basiert
DROP POLICY IF EXISTS "Project Company Isolation - SELECT" ON projects;
CREATE POLICY "Project Company Isolation - SELECT" 
ON projects FOR SELECT 
USING (
  -- Superadmin sieht alle
  is_superadmin(auth.uid()) OR
  -- STRIKT: Nur Projects der eigenen Company (KEINE Fallbacks!)
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- Goal Policies - NUR company_id basiert
DROP POLICY IF EXISTS "Goal Company Isolation - SELECT" ON goals;
CREATE POLICY "Goal Company Isolation - SELECT" 
ON goals FOR SELECT 
USING (
  -- Superadmin sieht alle
  is_superadmin(auth.uid()) OR
  -- STRIKT: Nur Goals der eigenen Company (KEINE Fallbacks!)
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);