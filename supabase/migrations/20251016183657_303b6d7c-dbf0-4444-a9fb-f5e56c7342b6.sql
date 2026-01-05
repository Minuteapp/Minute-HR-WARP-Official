-- Problem: Superadmins sehen alle Mitarbeiter, unabhängig vom company_id Filter
-- Lösung: Policy so ändern, dass sie die company_id Filterung respektiert

-- Lösche die alte strict_select_employees Policy
DROP POLICY IF EXISTS "strict_select_employees" ON employees;

-- Erstelle neue Policy: Superadmins sehen nur Mitarbeiter der effectiven Company
-- ODER normale Benutzer sehen nur Mitarbeiter ihrer eigenen Company
CREATE POLICY "strict_select_employees" 
ON employees 
FOR SELECT 
USING (company_id = get_effective_company_id() OR id = auth.uid());