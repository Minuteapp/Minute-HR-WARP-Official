-- BONUS: Goals RLS korrigieren
DROP POLICY IF EXISTS "Users can view goals in their company" ON goals;
DROP POLICY IF EXISTS "Users can create goals in their company" ON goals;
DROP POLICY IF EXISTS "Users can update goals in their company" ON goals;
DROP POLICY IF EXISTS "Users can delete goals in their company" ON goals;

CREATE POLICY "Users can view goals in their company" ON goals
  FOR SELECT USING (
    is_superadmin_safe(auth.uid()) OR
    company_id = get_effective_company_id()
  );

CREATE POLICY "Users can create goals in their company" ON goals
  FOR INSERT WITH CHECK (
    company_id = get_effective_company_id()
  );

CREATE POLICY "Users can update goals in their company" ON goals
  FOR UPDATE USING (
    is_superadmin_safe(auth.uid()) OR
    company_id = get_effective_company_id()
  );

CREATE POLICY "Users can delete goals in their company" ON goals
  FOR DELETE USING (
    is_superadmin_safe(auth.uid()) OR
    company_id = get_effective_company_id()
  );

DROP TRIGGER IF EXISTS set_company_id_goals ON goals;
CREATE TRIGGER set_company_id_goals
  BEFORE INSERT ON goals
  FOR EACH ROW EXECUTE FUNCTION auto_set_company_id();