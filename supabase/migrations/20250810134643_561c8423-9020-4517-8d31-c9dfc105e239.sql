-- Fix tasks policies: use array operator instead of jsonb cast
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
CREATE POLICY "tasks_select"
ON public.tasks
FOR SELECT
USING (
  is_admin_safe(auth.uid())
  OR created_by = auth.uid()
  OR (assigned_to @> ARRAY[auth.uid()]::uuid[])
);

DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
CREATE POLICY "tasks_update"
ON public.tasks
FOR UPDATE
USING (
  is_admin_safe(auth.uid())
  OR created_by = auth.uid()
  OR (assigned_to @> ARRAY[auth.uid()]::uuid[])
);
