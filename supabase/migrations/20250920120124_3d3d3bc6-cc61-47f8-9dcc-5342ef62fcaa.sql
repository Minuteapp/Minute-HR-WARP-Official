-- Intelligent Tenant Isolation - Only for tables that actually have company_id or can be linked via employees
-- This fixes the comprehensive tenant isolation by being smarter about which tables have which columns

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

-- CALENDAR_EVENTS (has company_id)
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
      company_id = get_user_company_id(auth.uid()) OR organizer_id = auth.uid()
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR organizer_id = auth.uid()
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

-- === TABLES WITHOUT COMPANY_ID - use employee_id or user_id to link to company ===

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

-- DOCUMENTS (no company_id, use uploaded_by -> employees.company_id)
DROP POLICY IF EXISTS "Company Documents Isolation" ON public.documents;
CREATE POLICY "Company Documents Isolation" ON public.documents
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      uploaded_by IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      uploaded_by = auth.uid() OR uploaded_by IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      uploaded_by IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      uploaded_by = auth.uid() OR uploaded_by IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
);

-- RECRUITING_APPLICATIONS (no company_id, use submitted_for_company_id if available)
DROP POLICY IF EXISTS "Company Recruiting Applications Isolation" ON public.recruiting_applications;
CREATE POLICY "Company Recruiting Applications Isolation" ON public.recruiting_applications
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      assigned_to IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      assigned_to = auth.uid() OR assigned_to IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      assigned_to IN (SELECT e.id FROM employees e WHERE e.company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      assigned_to = auth.uid() OR assigned_to IN (SELECT e.id FROM employees e WHERE e.company_id = get_user_company_id(auth.uid()))
  END
);

-- SHIFTS (no company_id, use employee_id -> employees.company_id)
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

-- TICKETS (no company_id, use requester_id -> employees.company_id)
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

-- PAYROLL_CALCULATIONS (no company_id, use user_id -> employees.company_id)
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

-- EXPENSE_REPORTS (no company_id, use employee_id -> employees.company_id)
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

-- INNOVATION_IDEAS (no company_id, use submitted_by -> employees.company_id)
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

-- PERFORMANCE_REVIEWS (no company_id, use employee_id -> employees.company_id)
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

-- BENEFITS_ENROLLMENTS (no company_id, use employee_id -> employees.company_id)
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

-- GLOBAL_MOBILITY_REQUESTS (no company_id, use employee_id -> employees.company_id)
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

-- CHAT_MESSAGES (no company_id, use sender_id -> employees.company_id)
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
  'intelligent_tenant_isolation_implemented', 
  'database', 
  'all_modules',
  jsonb_build_object(
    'message', 'Intelligent tenant isolation implemented for all modules',
    'direct_company_id_tables', ARRAY[
      'employees', 'user_roles', 'projects', 'tasks', 'goals', 
      'calendar_events', 'workflow_instances'
    ],
    'indirect_company_id_tables', ARRAY[
      'time_entries', 'documents', 'recruiting_applications', 'shifts', 
      'tickets', 'payroll_calculations', 'expense_reports', 'innovation_ideas',
      'performance_reviews', 'benefits_enrollments', 'global_mobility_requests',
      'chat_messages'
    ]
  )
);