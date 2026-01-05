-- FINAL Comprehensive Tenant Isolation - Using CORRECT column names from actual database structure
-- This migration only applies policies to tables and columns that actually exist

-- === TABLES WITH DIRECT COMPANY_ID ===

-- EMPLOYEES (has company_id)
DROP POLICY IF EXISTS "Company Employees Isolation" ON public.employees;
CREATE POLICY "Company Employees Isolation" ON public.employees
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR auth.uid() = id
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR auth.uid() = id
  END
);

-- USER_ROLES (has company_id)
DROP POLICY IF EXISTS "Company User Roles Isolation" ON public.user_roles;
CREATE POLICY "Company User Roles Isolation" ON public.user_roles
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR user_id = auth.uid()
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR user_id = auth.uid()
  END
);

-- PROJECTS (has company_id)
DROP POLICY IF EXISTS "Company Projects Isolation" ON public.projects;
CREATE POLICY "Company Projects Isolation" ON public.projects
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR owner_id = auth.uid()
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR owner_id = auth.uid()
  END
);

-- TASKS (has company_id)
DROP POLICY IF EXISTS "Company Tasks Isolation" ON public.tasks;
CREATE POLICY "Company Tasks Isolation" ON public.tasks
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR created_by = auth.uid()
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR created_by = auth.uid()
  END
);

-- GOALS (has company_id)
DROP POLICY IF EXISTS "Company Goals Isolation" ON public.goals;
CREATE POLICY "Company Goals Isolation" ON public.goals
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR created_by = auth.uid()
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR created_by = auth.uid()
  END
);

-- CALENDAR_EVENTS (has company_id AND created_by)
DROP POLICY IF EXISTS "Company Calendar Events Isolation" ON public.calendar_events;
CREATE POLICY "Company Calendar Events Isolation" ON public.calendar_events
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR created_by = auth.uid()
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR created_by = auth.uid()
  END
);

-- WORKFLOW_INSTANCES (has company_id)
DROP POLICY IF EXISTS "Company Workflow Instances Isolation" ON public.workflow_instances;
CREATE POLICY "Company Workflow Instances Isolation" ON public.workflow_instances
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR initiated_by = auth.uid()
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR initiated_by = auth.uid()
  END
);

-- === TABLES WITHOUT COMPANY_ID - use specific column to link to company ===

-- TIME_ENTRIES (no company_id, use user_id -> employees.company_id)
DROP POLICY IF EXISTS "Company Time Entries Isolation" ON public.time_entries;
CREATE POLICY "Company Time Entries Isolation" ON public.time_entries
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      user_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      user_id = auth.uid() OR user_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      user_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      user_id = auth.uid() OR user_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
);

-- DOCUMENTS (no company_id, use created_by -> employees.company_id)
DROP POLICY IF EXISTS "Company Documents Isolation" ON public.documents;
CREATE POLICY "Company Documents Isolation" ON public.documents
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      created_by IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      created_by = auth.uid() OR created_by IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      created_by IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      created_by = auth.uid() OR created_by IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
);

-- Only apply policies to tables that exist
-- For tables that don't exist, we skip them to avoid errors

-- Log the successful completion
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  auth.uid(), 
  'final_tenant_isolation_implemented', 
  'database', 
  'critical_modules',
  jsonb_build_object(
    'message', 'Final tenant isolation implemented for core modules using correct column names',
    'tables_updated', ARRAY[
      'employees', 'user_roles', 'projects', 'tasks', 'goals', 
      'calendar_events', 'workflow_instances', 'time_entries', 'documents'
    ],
    'tenant_context_enabled', true
  )
);