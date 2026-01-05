-- KRITISCHE REPARATUR: Tenant Isolation für alle Haupttabellen
-- Entferne alle widersprüchlichen Policies für projects, roadmaps, tasks, goals

-- PROJECTS
DROP POLICY IF EXISTS "Company Isolation for Projects" ON projects;
DROP POLICY IF EXISTS "Project Company Isolation - DELETE" ON projects;  
DROP POLICY IF EXISTS "Project Company Isolation - INSERT" ON projects;
DROP POLICY IF EXISTS "Project Company Isolation - SELECT" ON projects;
DROP POLICY IF EXISTS "Project Company Isolation - UPDATE" ON projects;
DROP POLICY IF EXISTS "Project Company Isolation CRITICAL" ON projects;
DROP POLICY IF EXISTS "SuperAdmin full access to projects" ON projects;

CREATE POLICY "projects_critical_tenant_isolation" 
ON projects FOR ALL 
USING (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR owner_id = auth.uid()
  END
)
WITH CHECK (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR owner_id = auth.uid()
  END
);

-- ROADMAPS
DROP POLICY IF EXISTS "Company Isolation for Roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Roadmap Company Isolation - DELETE" ON roadmaps;
DROP POLICY IF EXISTS "Roadmap Company Isolation - INSERT" ON roadmaps;
DROP POLICY IF EXISTS "Roadmap Company Isolation - SELECT" ON roadmaps;
DROP POLICY IF EXISTS "Roadmap Company Isolation - UPDATE" ON roadmaps;
DROP POLICY IF EXISTS "SuperAdmin full access to roadmaps" ON roadmaps;

CREATE POLICY "roadmaps_critical_tenant_isolation" 
ON roadmaps FOR ALL 
USING (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR created_by = auth.uid()
  END
)
WITH CHECK (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR created_by = auth.uid()
  END
);

-- TASKS
DROP POLICY IF EXISTS "Company Isolation for Tasks" ON tasks;
DROP POLICY IF EXISTS "Task Company Isolation - DELETE" ON tasks;
DROP POLICY IF EXISTS "Task Company Isolation - INSERT" ON tasks;
DROP POLICY IF EXISTS "Task Company Isolation - SELECT" ON tasks;
DROP POLICY IF EXISTS "Task Company Isolation - UPDATE" ON tasks;
DROP POLICY IF EXISTS "SuperAdmin full access to tasks" ON tasks;

CREATE POLICY "tasks_critical_tenant_isolation" 
ON tasks FOR ALL 
USING (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR user_id = auth.uid() OR created_by = auth.uid()
  END
)
WITH CHECK (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR user_id = auth.uid() OR created_by = auth.uid()
  END
);

-- GOALS
DROP POLICY IF EXISTS "Company Isolation for Goals" ON goals;
DROP POLICY IF EXISTS "Goal Company Isolation - DELETE" ON goals;
DROP POLICY IF EXISTS "Goal Company Isolation - INSERT" ON goals;
DROP POLICY IF EXISTS "Goal Company Isolation - SELECT" ON goals;
DROP POLICY IF EXISTS "Goal Company Isolation - UPDATE" ON goals;
DROP POLICY IF EXISTS "Goals company isolation" ON goals;
DROP POLICY IF EXISTS "SuperAdmin full access to goals" ON goals;

CREATE POLICY "goals_critical_tenant_isolation" 
ON goals FOR ALL 
USING (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR user_id = auth.uid() OR created_by = auth.uid()
  END
)
WITH CHECK (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR user_id = auth.uid() OR created_by = auth.uid()
  END
);