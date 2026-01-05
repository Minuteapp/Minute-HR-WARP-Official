-- ===== 4-SCHRITTE RLS-FIX (KORRIGIERT) =====

-- SCHRITT 1: employees_select_policy mit NULL-Klausel reparieren
DROP POLICY IF EXISTS "employees_select_policy" ON employees;

CREATE POLICY "employees_select_policy"
  ON employees FOR SELECT
  USING (
    (get_effective_company_id() IS NULL AND is_superadmin_safe(auth.uid()))
    OR (company_id = get_effective_company_id())
    OR (id = auth.uid())
  );

-- SCHRITT 2: time_entries_select_policy mit company_id erstellen
DROP POLICY IF EXISTS "time_entries_select_policy" ON time_entries;

CREATE POLICY "time_entries_select_policy"
  ON time_entries FOR SELECT
  USING (
    (get_effective_company_id() IS NULL AND is_superadmin_safe(auth.uid()))
    OR (auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = auth.uid() 
      AND e.company_id = get_effective_company_id()
    ))
  );

-- SCHRITT 3: projects_select_policy NEU erstellen
DROP POLICY IF EXISTS "projects_select_policy" ON projects;

CREATE POLICY "projects_select_policy"
  ON projects FOR SELECT
  USING (
    (get_effective_company_id() IS NULL AND is_superadmin_safe(auth.uid()))
    OR (company_id = get_effective_company_id())
  );

-- SCHRITT 4: tasks_select_policy mit company_id reparieren
DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_select_policy" ON tasks;

CREATE POLICY "tasks_select_policy"
  ON tasks FOR SELECT
  USING (
    (get_effective_company_id() IS NULL AND is_superadmin_safe(auth.uid()))
    OR (company_id = get_effective_company_id())
  );