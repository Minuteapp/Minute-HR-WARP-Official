-- =====================================================
-- RLS Policies für Daten-Einschränkungen (FINAL KORRIGIERT)
-- team_lead ist der korrekte Enum-Wert (nicht teamleiter)
-- =====================================================

-- 1. Performance Reviews: Mitarbeiter sehen nur eigene (KORREKTUR)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Employees see own performance" ON performance_reviews;
  
  CREATE POLICY "Employees see own performance"
  ON performance_reviews FOR SELECT
  TO authenticated
  USING (
    employee_id = auth.uid()
    OR
    reviewer_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr_admin', 'superadmin', 'team_lead', 'hr_manager', 'manager')
    )
  );
EXCEPTION WHEN undefined_table THEN
  NULL;
WHEN undefined_column THEN
  NULL;
END $$;

-- 2. Korrektur: Tasks Policy mit korrektem Enum
DO $$
BEGIN
  DROP POLICY IF EXISTS "Employees see own and team tasks" ON tasks;
  
  CREATE POLICY "Employees see own and team tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    auth.uid() = ANY(assigned_to)
    OR created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = tasks.project_id
      AND pm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr_admin', 'superadmin', 'team_lead', 'hr_manager', 'manager')
    )
  );
EXCEPTION WHEN undefined_table THEN
  NULL;
WHEN undefined_column THEN
  NULL;
END $$;

-- 3. Korrektur: Projects Policy mit korrektem Enum
DO $$
BEGIN
  DROP POLICY IF EXISTS "Employees see own and team projects" ON projects;
  
  CREATE POLICY "Employees see own and team projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = projects.id
      AND pm.user_id = auth.uid()
    )
    OR owner_id = auth.uid()
    OR created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr_admin', 'superadmin', 'team_lead', 'hr_manager', 'manager')
    )
  );
EXCEPTION WHEN undefined_table THEN
  NULL;
WHEN undefined_column THEN
  NULL;
END $$;

-- 4. Korrektur: Expenses Policy mit korrektem Enum
DO $$
BEGIN
  DROP POLICY IF EXISTS "Employees see own expenses" ON expenses;
  
  CREATE POLICY "Employees see own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR submitted_by = auth.uid()
    OR approver_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr_admin', 'superadmin', 'team_lead', 'hr_manager', 'manager')
    )
  );
EXCEPTION WHEN undefined_table THEN
  NULL;
WHEN undefined_column THEN
  NULL;
END $$;

-- 5. Korrektur: Business Travel Policy mit korrektem Enum
DO $$
BEGIN
  DROP POLICY IF EXISTS "Employees see own business travel" ON business_travel_requests;
  
  CREATE POLICY "Employees see own business travel"
  ON business_travel_requests FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR requested_by = auth.uid()
    OR approver_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr_admin', 'superadmin', 'team_lead', 'hr_manager', 'manager')
    )
  );
EXCEPTION WHEN undefined_table THEN
  NULL;
WHEN undefined_column THEN
  NULL;
END $$;