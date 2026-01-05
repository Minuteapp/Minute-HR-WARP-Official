-- GOALS POLICIES BEREINIGEN
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