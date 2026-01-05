-- BONUS: Objectives RLS korrigieren
DROP POLICY IF EXISTS "Users can view objectives in their company" ON objectives;
DROP POLICY IF EXISTS "Users can create objectives in their company" ON objectives;
DROP POLICY IF EXISTS "Users can update objectives in their company" ON objectives;
DROP POLICY IF EXISTS "Users can delete objectives in their company" ON objectives;

CREATE POLICY "Users can view objectives in their company" ON objectives
  FOR SELECT USING (
    is_superadmin_safe(auth.uid()) OR
    company_id = get_effective_company_id()
  );

CREATE POLICY "Users can create objectives in their company" ON objectives
  FOR INSERT WITH CHECK (
    company_id = get_effective_company_id()
  );

CREATE POLICY "Users can update objectives in their company" ON objectives
  FOR UPDATE USING (
    is_superadmin_safe(auth.uid()) OR
    company_id = get_effective_company_id()
  );

CREATE POLICY "Users can delete objectives in their company" ON objectives
  FOR DELETE USING (
    is_superadmin_safe(auth.uid()) OR
    company_id = get_effective_company_id()
  );

DROP TRIGGER IF EXISTS set_company_id_objectives ON objectives;
CREATE TRIGGER set_company_id_objectives
  BEFORE INSERT ON objectives
  FOR EACH ROW EXECUTE FUNCTION auto_set_company_id();