-- Step 2: NEUE STRICT POLICIES
CREATE POLICY "Employees - Company Isolation"
ON employees
FOR ALL
USING (company_id = get_effective_company_id())
WITH CHECK (company_id = get_effective_company_id());