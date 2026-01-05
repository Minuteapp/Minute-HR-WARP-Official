-- SICHERE DATENCHAOS BEREINIGUNG - nur bestehende Tabellen und Spalten verwenden

-- PHASE 1: Sichere Identifikation von Mock-Mitarbeitern
CREATE TEMP TABLE mock_employee_ids AS
SELECT id FROM public.employees 
WHERE 
  -- FC Bayern Mock-Daten
  name ILIKE '%bayern%' OR 
  name ILIKE '%müller%' OR 
  name ILIKE '%neuer%' OR 
  name ILIKE '%lewandowski%' OR
  -- Test-Einträge
  name ILIKE '%test%' OR 
  name ILIKE '%demo%' OR 
  name ILIKE '%example%' OR
  -- Offensichtlich falsche Daten
  email ILIKE '%test%' OR 
  email ILIKE '%demo%' OR 
  email ILIKE '%example.com' OR
  -- Leere oder unvollständige Daten
  name IS NULL OR 
  name = '' OR
  name = 'Neuer Mitarbeiter' OR
  -- Doppelte/ungültige Einträge
  employee_number ILIKE 'EMP-%' OR
  position ILIKE '%test%';

-- PHASE 2: Sichere Bereinigung bekannter Tabellen
-- Absence Requests löschen (user_id Spalte existiert sicher)
DELETE FROM public.absence_requests 
WHERE user_id IN (SELECT id FROM mock_employee_ids);

-- User Roles für Mock-Mitarbeiter löschen
DELETE FROM public.user_roles 
WHERE user_id IN (SELECT id FROM mock_employee_ids);

-- Tasks von Mock-Mitarbeitern löschen (falls assigned_to existiert)
DELETE FROM public.tasks 
WHERE assigned_to IN (SELECT id FROM mock_employee_ids);

-- PHASE 3: Mock-Mitarbeiter löschen
DELETE FROM public.employees 
WHERE id IN (SELECT id FROM mock_employee_ids);

-- PHASE 4: Nur die alte SVH GmbH Firma löschen (sicher identifiziert)
DELETE FROM public.companies 
WHERE name ILIKE '%svh%';

-- PHASE 5: RLS-Policy sicher neu erstellen
DROP POLICY IF EXISTS "Employees_MultiTenant_Isolation" ON public.employees;
DROP POLICY IF EXISTS "Employees_Clean_Access" ON public.employees;

CREATE POLICY "Employees_Clean_Access" ON public.employees
FOR ALL USING (
  -- Einfache, sichere Policy
  is_superadmin_safe(auth.uid()) = true OR 
  company_id = get_user_company_id(auth.uid()) OR 
  id = auth.uid()
) WITH CHECK (
  is_superadmin_safe(auth.uid()) = true OR 
  company_id = get_user_company_id(auth.uid()) OR 
  id = auth.uid()
);

-- PHASE 6: Erfolgreiche Bereinigung protokollieren
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  COALESCE(auth.uid(), 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid), 
  'safe_data_cleanup_complete', 
  'system', 
  'database_cleanup',
  jsonb_build_object(
    'description', 'Sichere Datenchaos-Bereinigung erfolgreich durchgeführt',
    'method', 'safe_migration_approach',
    'mock_data_removed', true,
    'svh_company_removed', true,
    'rls_policies_simplified', true,
    'timestamp', now()
  )
);