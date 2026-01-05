-- SCHRITT 5C: Business Trips RLS korrigieren
DROP POLICY IF EXISTS "Users can view their own business trips" ON business_trips;
DROP POLICY IF EXISTS "Users can create their own business trips" ON business_trips;
DROP POLICY IF EXISTS "Users can create business trips" ON business_trips;
DROP POLICY IF EXISTS "Users can update their own business trips" ON business_trips;
DROP POLICY IF EXISTS "Trip owners can update business trips" ON business_trips;
DROP POLICY IF EXISTS "Users can delete their own business trips" ON business_trips;

CREATE POLICY "Users can view business trips in their company" ON business_trips
  FOR SELECT USING (
    is_superadmin_safe(auth.uid()) OR
    (company_id = get_effective_company_id() AND employee_id = auth.uid())
  );

CREATE POLICY "Users can create business trips in their company" ON business_trips
  FOR INSERT WITH CHECK (
    company_id = get_effective_company_id()
  );

CREATE POLICY "Users can update business trips in their company" ON business_trips
  FOR UPDATE USING (
    company_id = get_effective_company_id() AND
    (employee_id = auth.uid() OR is_superadmin_safe(auth.uid()))
  );

CREATE POLICY "Users can delete business trips in their company" ON business_trips
  FOR DELETE USING (
    company_id = get_effective_company_id() AND
    (employee_id = auth.uid() OR is_superadmin_safe(auth.uid()))
  );

DROP TRIGGER IF EXISTS set_company_id_business_trips ON business_trips;
CREATE TRIGGER set_company_id_business_trips
  BEFORE INSERT ON business_trips
  FOR EACH ROW EXECUTE FUNCTION auto_set_company_id();