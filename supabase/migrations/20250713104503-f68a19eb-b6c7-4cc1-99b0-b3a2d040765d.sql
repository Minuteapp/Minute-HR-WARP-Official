-- Lösche alle überflüssigen und widersprüchlichen RLS-Policies
-- und erstelle saubere Company-Isolation

-- === EMPLOYEES POLICIES BEREINIGEN ===
DROP POLICY IF EXISTS "Users can view employees of their company" ON employees;
DROP POLICY IF EXISTS "Company isolation for employees_select" ON employees;
DROP POLICY IF EXISTS "Company isolation for employees_insert" ON employees;
DROP POLICY IF EXISTS "Company isolation for employees_update" ON employees;
DROP POLICY IF EXISTS "Company isolation for employees_delete" ON employees;

-- Neue saubere Employee Policies
CREATE POLICY "Employee Company Isolation - SELECT" 
ON employees FOR SELECT 
USING (
  -- Superadmin sieht alle
  is_superadmin(auth.uid()) OR
  -- User sehen nur ihre Company (KEINE NULL company_id im Tenant-Modus!)
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Employee Company Isolation - INSERT" 
ON employees FOR INSERT 
WITH CHECK (
  is_superadmin(auth.uid()) OR 
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Employee Company Isolation - UPDATE" 
ON employees FOR UPDATE 
USING (
  is_superadmin(auth.uid()) OR 
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Employee Company Isolation - DELETE" 
ON employees FOR DELETE 
USING (
  is_superadmin(auth.uid()) OR 
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- === TASKS POLICIES BEREINIGEN ===
DROP POLICY IF EXISTS "Company isolation for tasks_select" ON tasks;
DROP POLICY IF EXISTS "Company isolation for tasks_insert" ON tasks;
DROP POLICY IF EXISTS "Users can view company tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view their own tasks and tasks assigned to them" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks or assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "allow_select" ON tasks;

-- Neue saubere Task Policies
CREATE POLICY "Task Company Isolation - SELECT" 
ON tasks FOR SELECT 
USING (
  is_superadmin(auth.uid()) OR
  -- Nur Tasks der eigenen Company (KEINE NULL company_id!)
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR
  -- Eigene Tasks (fallback für tasks ohne company_id)
  (created_by = auth.uid()) OR
  (auth.uid() = ANY(assigned_to))
);

CREATE POLICY "Task Company Isolation - INSERT" 
ON tasks FOR INSERT 
WITH CHECK (
  is_superadmin(auth.uid()) OR 
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR
  created_by = auth.uid()
);

CREATE POLICY "Task Company Isolation - UPDATE" 
ON tasks FOR UPDATE 
USING (
  is_superadmin(auth.uid()) OR 
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR
  created_by = auth.uid() OR 
  auth.uid() = ANY(assigned_to)
);

CREATE POLICY "Task Company Isolation - DELETE" 
ON tasks FOR DELETE 
USING (
  is_superadmin(auth.uid()) OR 
  created_by = auth.uid()
);

-- === PROJECTS POLICIES BEREINIGEN ===
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

-- === GOALS POLICIES BEREINIGEN ===
DROP POLICY IF EXISTS "Company isolation for goals" ON goals;
DROP POLICY IF EXISTS "Users can view goals they created or are assigned to" ON goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON goals;
DROP POLICY IF EXISTS "Users can update goals they created or are assigned to" ON goals;
DROP POLICY IF EXISTS "Users can delete goals they created" ON goals;
DROP POLICY IF EXISTS "enable_all_access_for_authenticated_users" ON goals;

-- Neue saubere Goal Policies
CREATE POLICY "Goal Company Isolation - SELECT" 
ON goals FOR SELECT 
USING (
  is_superadmin(auth.uid()) OR
  -- Nur Goals der eigenen Company (KEINE NULL company_id!)
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR
  -- Eigene Goals (fallback)
  created_by = auth.uid() OR
  assigned_to = auth.uid()
);

CREATE POLICY "Goal Company Isolation - INSERT" 
ON goals FOR INSERT 
WITH CHECK (
  is_superadmin(auth.uid()) OR 
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR
  created_by = auth.uid()
);

CREATE POLICY "Goal Company Isolation - UPDATE" 
ON goals FOR UPDATE 
USING (
  is_superadmin(auth.uid()) OR 
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR
  created_by = auth.uid() OR
  assigned_to = auth.uid()
);

CREATE POLICY "Goal Company Isolation - DELETE" 
ON goals FOR DELETE 
USING (
  is_superadmin(auth.uid()) OR 
  created_by = auth.uid()
);