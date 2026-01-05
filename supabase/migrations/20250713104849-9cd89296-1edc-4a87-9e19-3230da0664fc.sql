-- PROJECTS POLICIES BEREINIGEN
DROP POLICY IF EXISTS "Company isolation for projects_select" ON projects;
DROP POLICY IF EXISTS "Users can view company projects" ON projects;
DROP POLICY IF EXISTS "Users can view projects" ON projects;
DROP POLICY IF EXISTS "Users can view assigned projects" ON projects;
DROP POLICY IF EXISTS "Everyone can view active projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update for project owner" ON projects;
DROP POLICY IF EXISTS "Users can update their projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their projects" ON projects;

-- Neue saubere Project Policies
CREATE POLICY "Project Company Isolation - SELECT" 
ON projects FOR SELECT 
USING (
  is_superadmin(auth.uid()) OR
  -- Nur Projects der eigenen Company (KEINE NULL company_id!)
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR
  -- Eigene Projects (fallback)
  owner_id = auth.uid() OR
  auth.uid() = ANY(team_members)
);

CREATE POLICY "Project Company Isolation - INSERT" 
ON projects FOR INSERT 
WITH CHECK (
  is_superadmin(auth.uid()) OR 
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR
  owner_id = auth.uid()
);

CREATE POLICY "Project Company Isolation - UPDATE" 
ON projects FOR UPDATE 
USING (
  is_superadmin(auth.uid()) OR 
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR
  owner_id = auth.uid() OR
  auth.uid() = ANY(team_members)
);

CREATE POLICY "Project Company Isolation - DELETE" 
ON projects FOR DELETE 
USING (
  is_superadmin(auth.uid()) OR 
  owner_id = auth.uid()
);