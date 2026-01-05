-- SCHRITT 5A KORRIGIERT: Tasks RLS mit Array-Handling
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks assigned to them" ON tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Task creators and assignees can update tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks in their company" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks in their company" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks in their company" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks in their company" ON tasks;

CREATE POLICY "Users can view tasks in their company" ON tasks
  FOR SELECT USING (
    is_superadmin_safe(auth.uid()) OR
    (company_id = get_effective_company_id() AND (
      created_by = auth.uid() OR
      auth.uid() = ANY(assigned_to)
    ))
  );

CREATE POLICY "Users can create tasks in their company" ON tasks
  FOR INSERT WITH CHECK (
    company_id = get_effective_company_id()
  );

CREATE POLICY "Users can update tasks in their company" ON tasks
  FOR UPDATE USING (
    company_id = get_effective_company_id() AND
    (created_by = auth.uid() OR auth.uid() = ANY(assigned_to) OR is_superadmin_safe(auth.uid()))
  );

CREATE POLICY "Users can delete tasks in their company" ON tasks
  FOR DELETE USING (
    company_id = get_effective_company_id() AND
    (created_by = auth.uid() OR is_superadmin_safe(auth.uid()))
  );

DROP TRIGGER IF EXISTS set_company_id_tasks ON tasks;
CREATE TRIGGER set_company_id_tasks
  BEFORE INSERT ON tasks
  FOR EACH ROW EXECUTE FUNCTION auto_set_company_id();