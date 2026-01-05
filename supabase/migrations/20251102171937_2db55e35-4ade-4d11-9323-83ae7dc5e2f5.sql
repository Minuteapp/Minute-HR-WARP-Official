-- SCHRITT 4: Projects RLS korrigieren
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view projects they're assigned to" ON projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Project owners and admins can update projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

CREATE POLICY "Users can view projects in their company" ON projects
  FOR SELECT USING (
    is_superadmin_safe(auth.uid()) OR
    (company_id = get_effective_company_id() AND (
      owner_id = auth.uid() OR
      auth.uid() = ANY(team_members)
    ))
  );

CREATE POLICY "Users can create projects in their company" ON projects
  FOR INSERT WITH CHECK (
    company_id = get_effective_company_id()
  );

CREATE POLICY "Users can update projects in their company" ON projects
  FOR UPDATE USING (
    company_id = get_effective_company_id() AND
    (owner_id = auth.uid() OR is_superadmin_safe(auth.uid()))
  );

CREATE POLICY "Users can delete projects in their company" ON projects
  FOR DELETE USING (
    company_id = get_effective_company_id() AND
    (owner_id = auth.uid() OR is_superadmin_safe(auth.uid()))
  );

DROP TRIGGER IF EXISTS set_company_id_projects ON projects;
CREATE TRIGGER set_company_id_projects
  BEFORE INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION auto_set_company_id();