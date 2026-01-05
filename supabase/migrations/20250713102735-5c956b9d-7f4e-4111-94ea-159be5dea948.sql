-- Company-Isolation für employees Tabelle verbessern
-- Die aktuellen RLS-Policies aktualisieren um sicherzustellen, dass nur Company-spezifische Daten angezeigt werden

-- Zunächst die existierende Policy für employees überprüfen und verbessern
DROP POLICY IF EXISTS "Company isolation for employees_select" ON employees;

CREATE POLICY "Company isolation for employees_select" 
ON employees FOR SELECT 
USING (
  -- Superadmin sieht alle Mitarbeiter
  is_superadmin(auth.uid()) OR
  -- Normale User sehen nur ihre Firma
  (company_id IN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.company_id IS NOT NULL
  ))
);

-- Verbesserung der RLS-Policy für absence_requests um Company-Isolation sicherzustellen
DROP POLICY IF EXISTS "Company isolation for absence_requests" ON absence_requests;

CREATE POLICY "Company isolation for absence_requests"
ON absence_requests FOR SELECT
USING (
  -- Superadmin sieht alle
  is_superadmin(auth.uid()) OR
  -- User sieht nur Anträge seiner Company (über employee lookup)
  (user_id IN (
    SELECT e.user_id 
    FROM employees e
    JOIN user_roles ur ON ur.user_id = auth.uid()
    WHERE e.company_id = ur.company_id
    AND ur.company_id IS NOT NULL
  )) OR
  -- Direkter Zugriff auf eigene Anträge
  (auth.uid() = user_id)
);

-- Verbesserung der RLS-Policy für tasks um Company-Isolation sicherzustellen
DROP POLICY IF EXISTS "Company isolation for tasks" ON tasks;

CREATE POLICY "Company isolation for tasks"
ON tasks FOR SELECT
USING (
  -- Superadmin sieht alle
  is_superadmin(auth.uid()) OR
  -- User sieht nur Tasks seiner Company (über user_roles)
  (auth.uid() IN (
    SELECT ur.user_id 
    FROM user_roles ur
    WHERE ur.company_id IS NOT NULL
  )) OR
  -- Direkter Zugriff auf eigene Tasks
  (auth.uid() = created_by OR auth.uid() = assigned_to)
);

-- Verbesserung der RLS-Policy für goals um Company-Isolation sicherzustellen  
DROP POLICY IF EXISTS "Company isolation for goals" ON goals;

CREATE POLICY "Company isolation for goals"
ON goals FOR SELECT
USING (
  -- Superadmin sieht alle
  is_superadmin(auth.uid()) OR
  -- User sieht nur Goals seiner Company (über user_roles)
  (auth.uid() IN (
    SELECT ur.user_id 
    FROM user_roles ur
    WHERE ur.company_id IS NOT NULL
  )) OR
  -- Direkter Zugriff auf eigene Goals
  (auth.uid() = created_by OR auth.uid() = assigned_to)
);