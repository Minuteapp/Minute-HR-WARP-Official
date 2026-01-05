-- Comprehensive Tenant Isolation for ALL modules
-- Drop existing policies and create new ones with proper tenant context support

-- === EMPLOYEES ===
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

-- === USER_ROLES ===
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

-- === TIME_ENTRIES ===
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

-- === PROJECTS ===
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

-- === TASKS ===
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

-- === GOALS ===
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

-- === DOCUMENTS ===
DROP POLICY IF EXISTS "Company Documents Isolation" ON public.documents;
CREATE POLICY "Company Documents Isolation" ON public.documents
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR uploaded_by = auth.uid()
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR uploaded_by = auth.uid()
  END
);

-- === RECRUITING APPLICATIONS ===
DROP POLICY IF EXISTS "Company Recruiting Applications Isolation" ON public.recruiting_applications;
CREATE POLICY "Company Recruiting Applications Isolation" ON public.recruiting_applications
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid())
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid())
  END
);

-- === SHIFTS ===
DROP POLICY IF EXISTS "Company Shifts Isolation" ON public.shifts;
CREATE POLICY "Company Shifts Isolation" ON public.shifts
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      employee_id = auth.uid() OR employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      employee_id = auth.uid() OR employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
);

-- === TICKETS ===
DROP POLICY IF EXISTS "Company Tickets Isolation" ON public.tickets;
CREATE POLICY "Company Tickets Isolation" ON public.tickets
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      requester_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      requester_id = auth.uid() OR requester_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      requester_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      requester_id = auth.uid() OR requester_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
);

-- === PAYROLL_CALCULATIONS ===
DROP POLICY IF EXISTS "Company Payroll Calculations Isolation" ON public.payroll_calculations;
CREATE POLICY "Company Payroll Calculations Isolation" ON public.payroll_calculations
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

-- === EXPENSE_REPORTS ===
DROP POLICY IF EXISTS "Company Expense Reports Isolation" ON public.expense_reports;
CREATE POLICY "Company Expense Reports Isolation" ON public.expense_reports
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      employee_id = auth.uid() OR employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      employee_id = auth.uid() OR employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
);

-- === CALENDAR_EVENTS ===
DROP POLICY IF EXISTS "Company Calendar Events Isolation" ON public.calendar_events;
CREATE POLICY "Company Calendar Events Isolation" ON public.calendar_events
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      organizer_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      organizer_id = auth.uid() OR organizer_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      organizer_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      organizer_id = auth.uid() OR organizer_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
);

-- === INNOVATION_IDEAS ===
DROP POLICY IF EXISTS "Company Innovation Ideas Isolation" ON public.innovation_ideas;
CREATE POLICY "Company Innovation Ideas Isolation" ON public.innovation_ideas
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      submitted_by IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      submitted_by = auth.uid() OR submitted_by IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      submitted_by IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      submitted_by = auth.uid() OR submitted_by IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
);

-- === PERFORMANCE_REVIEWS ===
DROP POLICY IF EXISTS "Company Performance Reviews Isolation" ON public.performance_reviews;
CREATE POLICY "Company Performance Reviews Isolation" ON public.performance_reviews
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      employee_id = auth.uid() OR employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      employee_id = auth.uid() OR employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
);

-- === BUDGET_ITEMS ===
DROP POLICY IF EXISTS "Company Budget Items Isolation" ON public.budget_items;
CREATE POLICY "Company Budget Items Isolation" ON public.budget_items
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid())
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid())
  END
);

-- === WORKFLOW_INSTANCES ===
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

-- === ENVIRONMENT_METRICS ===
DROP POLICY IF EXISTS "Company Environment Metrics Isolation" ON public.environment_metrics;
CREATE POLICY "Company Environment Metrics Isolation" ON public.environment_metrics
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid())
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid())
  END
);

-- === BENEFITS_ENROLLMENTS ===
DROP POLICY IF EXISTS "Company Benefits Enrollments Isolation" ON public.benefits_enrollments;
CREATE POLICY "Company Benefits Enrollments Isolation" ON public.benefits_enrollments
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      employee_id = auth.uid() OR employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      employee_id = auth.uid() OR employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
);

-- === GLOBAL_MOBILITY_REQUESTS ===
DROP POLICY IF EXISTS "Company Global Mobility Requests Isolation" ON public.global_mobility_requests;
CREATE POLICY "Company Global Mobility Requests Isolation" ON public.global_mobility_requests
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      employee_id = auth.uid() OR employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      employee_id = auth.uid() OR employee_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
);

-- === CHAT_MESSAGES ===
DROP POLICY IF EXISTS "Company Chat Messages Isolation" ON public.chat_messages;
CREATE POLICY "Company Chat Messages Isolation" ON public.chat_messages
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      sender_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      sender_id = auth.uid() OR sender_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      sender_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      sender_id = auth.uid() OR sender_id IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
);

-- Log the completion
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  auth.uid(), 
  'tenant_isolation_implemented', 
  'database', 
  'all_modules',
  jsonb_build_object(
    'message', 'Comprehensive tenant isolation implemented for all modules',
    'modules_updated', ARRAY[
      'employees', 'user_roles', 'time_entries', 'projects', 'tasks', 'goals', 
      'documents', 'recruiting_applications', 'shifts', 'tickets', 'payroll_calculations',
      'expense_reports', 'calendar_events', 'innovation_ideas', 'performance_reviews',
      'budget_items', 'workflow_instances', 'environment_metrics', 'benefits_enrollments',
      'global_mobility_requests', 'chat_messages'
    ]
  )
);