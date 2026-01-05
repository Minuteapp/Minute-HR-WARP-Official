-- TASKS POLICIES BEREINIGEN
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