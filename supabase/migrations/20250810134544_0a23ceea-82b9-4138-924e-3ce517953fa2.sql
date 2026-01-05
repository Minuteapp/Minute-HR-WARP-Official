-- Broad RLS fixes across modules to unblock actions (time, vacation, tasks, projects, salary, documents, chat)

-- 0) Helper: ensure RLS enabled where needed
ALTER TABLE IF EXISTS public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.employee_salary_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.absence_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.absence_documents ENABLE ROW LEVEL SECURITY;

-- 1) time_entries: owner or admin can manage
DROP POLICY IF EXISTS "time_entries_select" ON public.time_entries;
CREATE POLICY "time_entries_select"
ON public.time_entries
FOR SELECT
USING (is_admin_safe(auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "time_entries_insert" ON public.time_entries;
CREATE POLICY "time_entries_insert"
ON public.time_entries
FOR INSERT
WITH CHECK (is_admin_safe(auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "time_entries_update" ON public.time_entries;
CREATE POLICY "time_entries_update"
ON public.time_entries
FOR UPDATE
USING (is_admin_safe(auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "time_entries_delete" ON public.time_entries;
CREATE POLICY "time_entries_delete"
ON public.time_entries
FOR DELETE
USING (is_admin_safe(auth.uid()) OR user_id = auth.uid());

-- 2) tasks: creator, assignee, or admin
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
CREATE POLICY "tasks_select"
ON public.tasks
FOR SELECT
USING (
  is_admin_safe(auth.uid())
  OR created_by = auth.uid()
  OR (assigned_to IS NOT NULL AND assigned_to::jsonb ? auth.uid()::text)
);

DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
CREATE POLICY "tasks_insert"
ON public.tasks
FOR INSERT
WITH CHECK (is_admin_safe(auth.uid()) OR created_by = auth.uid());

DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
CREATE POLICY "tasks_update"
ON public.tasks
FOR UPDATE
USING (
  is_admin_safe(auth.uid())
  OR created_by = auth.uid()
  OR (assigned_to IS NOT NULL AND assigned_to::jsonb ? auth.uid()::text)
);

DROP POLICY IF EXISTS "tasks_delete" ON public.tasks;
CREATE POLICY "tasks_delete"
ON public.tasks
FOR DELETE
USING (is_admin_safe(auth.uid()) OR created_by = auth.uid());

-- 3) project_assignments: user or admin
DROP POLICY IF EXISTS "project_assignments_select" ON public.project_assignments;
CREATE POLICY "project_assignments_select"
ON public.project_assignments
FOR SELECT
USING (is_admin_safe(auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "project_assignments_insert" ON public.project_assignments;
CREATE POLICY "project_assignments_insert"
ON public.project_assignments
FOR INSERT
WITH CHECK (is_admin_safe(auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "project_assignments_update" ON public.project_assignments;
CREATE POLICY "project_assignments_update"
ON public.project_assignments
FOR UPDATE
USING (is_admin_safe(auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "project_assignments_delete" ON public.project_assignments;
CREATE POLICY "project_assignments_delete"
ON public.project_assignments
FOR DELETE
USING (is_admin_safe(auth.uid()) OR user_id = auth.uid());

-- 4) employee_salary_history: admin or employee can read; updates managed elsewhere
DROP POLICY IF EXISTS "employee_salary_history_select" ON public.employee_salary_history;
CREATE POLICY "employee_salary_history_select"
ON public.employee_salary_history
FOR SELECT
USING (is_admin_safe(auth.uid()) OR employee_id = auth.uid());

-- 5) employee_documents: admin or employee owner
DROP POLICY IF EXISTS "employee_documents_select" ON public.employee_documents;
CREATE POLICY "employee_documents_select"
ON public.employee_documents
FOR SELECT
USING (is_admin_safe(auth.uid()) OR employee_id = auth.uid());

DROP POLICY IF EXISTS "employee_documents_insert" ON public.employee_documents;
CREATE POLICY "employee_documents_insert"
ON public.employee_documents
FOR INSERT
WITH CHECK (is_admin_safe(auth.uid()) OR employee_id = auth.uid());

DROP POLICY IF EXISTS "employee_documents_update" ON public.employee_documents;
CREATE POLICY "employee_documents_update"
ON public.employee_documents
FOR UPDATE
USING (is_admin_safe(auth.uid()) OR employee_id = auth.uid());

DROP POLICY IF EXISTS "employee_documents_delete" ON public.employee_documents;
CREATE POLICY "employee_documents_delete"
ON public.employee_documents
FOR DELETE
USING (is_admin_safe(auth.uid()) OR employee_id = auth.uid());

-- 6) absence_documents: extend to admins too (besides owner)
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.absence_documents;
CREATE POLICY "Users/Admins can insert absence documents"
ON public.absence_documents
FOR INSERT
WITH CHECK (
  is_admin_safe(auth.uid()) OR EXISTS (
    SELECT 1 FROM absence_requests ar
    WHERE ar.id = absence_documents.absence_request_id AND ar.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view their own documents" ON public.absence_documents;
CREATE POLICY "Users/Admins can view absence documents"
ON public.absence_documents
FOR SELECT
USING (
  is_admin_safe(auth.uid()) OR EXISTS (
    SELECT 1 FROM absence_requests ar
    WHERE ar.id = absence_documents.absence_request_id AND ar.user_id = auth.uid()
  )
);

-- 7) absence_requests: make inserts/updates explicit for owners and admins
DROP POLICY IF EXISTS "Absence requests insert" ON public.absence_requests;
CREATE POLICY "Absence requests insert"
ON public.absence_requests
FOR INSERT
WITH CHECK (
  is_admin_safe(auth.uid()) OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "Absence requests update" ON public.absence_requests;
CREATE POLICY "Absence requests update"
ON public.absence_requests
FOR UPDATE
USING (
  is_admin_safe(auth.uid()) OR user_id = auth.uid()
);

-- 8) channel_members: replace any recursive policies with safe ones
DROP POLICY IF EXISTS "channel_members_select" ON public.channel_members;
CREATE POLICY "channel_members_select"
ON public.channel_members
FOR SELECT
USING (is_admin_safe(auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "channel_members_insert" ON public.channel_members;
CREATE POLICY "channel_members_insert"
ON public.channel_members
FOR INSERT
WITH CHECK (is_admin_safe(auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "channel_members_update" ON public.channel_members;
CREATE POLICY "channel_members_update"
ON public.channel_members
FOR UPDATE
USING (is_admin_safe(auth.uid()));

DROP POLICY IF EXISTS "channel_members_delete" ON public.channel_members;
CREATE POLICY "channel_members_delete"
ON public.channel_members
FOR DELETE
USING (is_admin_safe(auth.uid()) OR user_id = auth.uid());