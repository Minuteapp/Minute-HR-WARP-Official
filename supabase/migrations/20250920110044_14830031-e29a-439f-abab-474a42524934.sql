-- KRITISCH: Reparatur der restlichen Workforce Tables
-- TASKS, ROADMAPS, GOALS brauchen auch korrekte Isolation

-- ROADMAPS
DROP POLICY IF EXISTS "roadmaps_critical_tenant_isolation" ON roadmaps;

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
DROP POLICY IF EXISTS "tasks_critical_tenant_isolation" ON tasks;

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
DROP POLICY IF EXISTS "goals_critical_tenant_isolation" ON goals;

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