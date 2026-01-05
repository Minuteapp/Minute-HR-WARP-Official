
-- CRITICAL FIX: Entferne alle unsicheren employee Policies und ersetze durch strikte Isolation
-- Problem: Alte Policies geben Superadmins unbeschränkten Zugriff ohne company_id Check

-- Lösche ALLE alten Policies
DROP POLICY IF EXISTS "Admins can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can manage employees in their company" ON public.employees;
DROP POLICY IF EXISTS "HR can manage employee data" ON public.employees;
DROP POLICY IF EXISTS "Users can view their own employee data" ON public.employees;
DROP POLICY IF EXISTS "Users can view their own employee record" ON public.employees;
DROP POLICY IF EXISTS "Admins manage employees in effective company" ON public.employees;
DROP POLICY IF EXISTS "Users view employees in effective company" ON public.employees;

-- Erstelle NEUE, STRIKTE Policy für SELECT
-- Regel: Nur Zugriff auf Employees der effektiven Company
CREATE POLICY "Strict company isolation for SELECT" 
ON public.employees 
FOR SELECT 
USING (
  -- Nur wenn effective company_id gesetzt ist UND übereinstimmt
  get_effective_company_id() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- Policy für INSERT - nur mit effective company_id
CREATE POLICY "Strict company isolation for INSERT" 
ON public.employees 
FOR INSERT 
WITH CHECK (
  get_effective_company_id() IS NOT NULL 
  AND company_id = get_effective_company_id()
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'superadmin')
  )
);

-- Policy für UPDATE - nur für eigene Company
CREATE POLICY "Strict company isolation for UPDATE" 
ON public.employees 
FOR UPDATE 
USING (
  get_effective_company_id() IS NOT NULL 
  AND company_id = get_effective_company_id()
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'superadmin')
  )
);

-- Policy für DELETE - nur für eigene Company
CREATE POLICY "Strict company isolation for DELETE" 
ON public.employees 
FOR DELETE 
USING (
  get_effective_company_id() IS NOT NULL 
  AND company_id = get_effective_company_id()
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'superadmin')
  )
);
