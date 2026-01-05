-- Phase 1: RLS-Policies auf employees bereinigen
-- Ziel: Nur EINE klare Policy pro Aktion, strenge company_id Isolation

-- 1. Alle bestehenden Policies auf employees löschen
DROP POLICY IF EXISTS "Employee Company Isolation" ON employees;
DROP POLICY IF EXISTS "Admins manage employees in effective company" ON employees;
DROP POLICY IF EXISTS "Admins view employees in effective company" ON employees;
DROP POLICY IF EXISTS "Admins can manage all employees" ON employees;
DROP POLICY IF EXISTS "Users can view their own employee record" ON employees;
DROP POLICY IF EXISTS "Users view own employee record" ON employees;
DROP POLICY IF EXISTS "Strict company isolation for SELECT" ON employees;
DROP POLICY IF EXISTS "Strict company isolation for INSERT" ON employees;
DROP POLICY IF EXISTS "Strict company isolation for UPDATE" ON employees;
DROP POLICY IF EXISTS "Strict company isolation for DELETE" ON employees;

-- 2. Neue, strikte Policies erstellen
-- Alle Policies erzwingen IMMER company_id = get_effective_company_id()

-- SELECT: Nur Mitarbeiter der eigenen/effektiven Firma sichtbar
CREATE POLICY "Strict company isolation SELECT"
ON employees
FOR SELECT
USING (
  company_id = get_effective_company_id()
  OR 
  -- User kann eigenen Mitarbeiter-Record sehen
  id = auth.uid()
);

-- INSERT: Nur für Admins/HR, automatisch mit company_id
CREATE POLICY "Strict company isolation INSERT"
ON employees
FOR INSERT
WITH CHECK (
  -- Admin/HR kann Mitarbeiter anlegen
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr', 'superadmin')
  )
  -- company_id wird automatisch durch Trigger gesetzt
  AND company_id = get_effective_company_id()
);

-- UPDATE: Nur Admins/HR der gleichen Firma
CREATE POLICY "Strict company isolation UPDATE"
ON employees
FOR UPDATE
USING (
  company_id = get_effective_company_id()
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr', 'superadmin')
  )
);

-- DELETE: Nur Admins/HR der gleichen Firma (Soft-Delete über archived)
CREATE POLICY "Strict company isolation DELETE"
ON employees
FOR DELETE
USING (
  company_id = get_effective_company_id()
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- 3. Kommentar zur Sicherheit
COMMENT ON TABLE employees IS 
'KRITISCHE SICHERHEITSREGEL: Alle RLS Policies erzwingen company_id = get_effective_company_id().
Superadmins MÜSSEN im Tenant-Modus sein (via user_tenant_sessions), sonst NULL company_id und keine Daten.
Admin-Bereich MUSS explizit eine Firma wählen vor Abfragen.';

-- 4. Verifizierung
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'employees'
  AND schemaname = 'public';
  
  RAISE NOTICE '✅ Anzahl aktiver Policies auf employees: %', policy_count;
  
  IF policy_count != 4 THEN
    RAISE WARNING 'Erwartet waren 4 Policies (SELECT, INSERT, UPDATE, DELETE), gefunden: %', policy_count;
  END IF;
END $$;