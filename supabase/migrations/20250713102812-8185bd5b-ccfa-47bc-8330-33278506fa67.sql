-- Company-Isolation für alle relevanten Tabellen verbessern
-- Die aktuellen RLS-Policies aktualisieren um sicherzustellen, dass nur Company-spezifische Daten angezeigt werden

-- Zunächst prüfen welche user_id mit welcher company_id verknüpft ist
-- und die RLS-Policies entsprechend anpassen

-- Einfache Company-Isolation basierend auf user_roles
CREATE OR REPLACE FUNCTION get_user_company_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT company_id 
  FROM user_roles 
  WHERE user_id = user_uuid 
  AND company_id IS NOT NULL
  LIMIT 1;
$$;

-- RLS-Policy für employees aktualisieren
DROP POLICY IF EXISTS "Company isolation for employees_select" ON employees;

CREATE POLICY "Company isolation for employees_select" 
ON employees FOR SELECT 
USING (
  -- Superadmin sieht alle Mitarbeiter
  is_superadmin(auth.uid()) OR
  -- Normale User sehen nur ihre Firma
  (company_id = get_user_company_id(auth.uid()))
);

-- RLS-Policy für absence_requests aktualisieren  
DROP POLICY IF EXISTS "Company isolation for absence_requests" ON absence_requests;

CREATE POLICY "Company isolation for absence_requests"
ON absence_requests FOR SELECT
USING (
  -- Superadmin sieht alle
  is_superadmin(auth.uid()) OR
  -- User sieht nur Anträge seiner Company
  (user_id IN (
    SELECT id 
    FROM employees e
    WHERE e.company_id = get_user_company_id(auth.uid())
  )) OR
  -- Direkter Zugriff auf eigene Anträge
  (auth.uid() = user_id)
);