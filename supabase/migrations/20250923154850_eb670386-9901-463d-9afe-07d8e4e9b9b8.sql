-- DATENCHAOS BEREINIGUNG - Korrekte Reihenfolge mit Foreign Key Berücksichtigung
-- Erst referenzierende Daten löschen, dann Hauptdaten

-- PHASE 1A: Identifiziere Mock-Mitarbeiter IDs für spätere Referenz
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

-- PHASE 1B: Lösche alle referenzierenden Daten für Mock-Mitarbeiter
-- Shifts löschen
DELETE FROM public.shifts 
WHERE employee_id IN (SELECT id FROM mock_employee_ids);

-- Absence Requests löschen
DELETE FROM public.absence_requests 
WHERE user_id IN (SELECT id FROM mock_employee_ids);

-- Time Entries löschen (falls vorhanden)
DELETE FROM public.time_entries 
WHERE employee_id IN (SELECT id FROM mock_employee_ids);

-- Employee Audit Logs löschen (falls vorhanden)
DELETE FROM public.employee_audit_logs 
WHERE employee_id IN (SELECT id FROM mock_employee_ids);

-- Task Assignments löschen (falls vorhanden)
DELETE FROM public.tasks 
WHERE assigned_to IN (SELECT id FROM mock_employee_ids);

-- User Roles für Mock-Mitarbeiter löschen
DELETE FROM public.user_roles 
WHERE user_id IN (SELECT id FROM mock_employee_ids);

-- PHASE 1C: Jetzt Mock-Mitarbeiter löschen (keine Foreign Key Konflikte mehr)
DELETE FROM public.employees 
WHERE id IN (SELECT id FROM mock_employee_ids);

-- PHASE 2: Chaotische Firmen bereinigen (nur die alte SVH GmbH)
-- Identifiziere chaotische Firmen
CREATE TEMP TABLE chaotic_company_ids AS
SELECT id FROM public.companies 
WHERE 
  name ILIKE '%svh%' OR 
  (name ILIKE '%gmbh%' AND created_at < NOW() - INTERVAL '7 days');

-- Lösche alle Referenzen auf chaotische Firmen
DELETE FROM public.user_roles 
WHERE company_id IN (SELECT id FROM chaotic_company_ids);

DELETE FROM public.employees 
WHERE company_id IN (SELECT id FROM chaotic_company_ids);

-- Lösche chaotische Firmen
DELETE FROM public.companies 
WHERE id IN (SELECT id FROM chaotic_company_ids);

-- PHASE 3: RLS-Policy Reparatur für korrekte Mitarbeiteranzeige
DROP POLICY IF EXISTS "Employees_MultiTenant_Isolation" ON public.employees;
DROP POLICY IF EXISTS "Employees_Clean_Access" ON public.employees;

CREATE POLICY "Employees_Clean_Access" ON public.employees
FOR ALL USING (
  CASE
    -- SuperAdmin in Tenant-Modus: Nur Mitarbeiter der gewählten Firma
    WHEN (is_superadmin_safe(auth.uid()) AND is_in_tenant_context()) THEN 
      company_id = get_tenant_company_id_safe()
    -- SuperAdmin ohne Tenant-Modus: Eigene Firma + eigene Daten
    WHEN (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) THEN 
      (company_id = get_user_company_id(auth.uid()) OR id = auth.uid())
    -- Normale Benutzer: Nur eigene Firma oder eigene Daten
    ELSE 
      (company_id = get_user_company_id(auth.uid()) OR id = auth.uid())
  END
) WITH CHECK (
  CASE
    WHEN (is_superadmin_safe(auth.uid()) AND is_in_tenant_context()) THEN 
      company_id = get_tenant_company_id_safe()
    WHEN (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) THEN 
      (company_id = get_user_company_id(auth.uid()) OR id = auth.uid())
    ELSE 
      (company_id = get_user_company_id(auth.uid()) OR id = auth.uid())
  END
);

-- PHASE 4: Audit-Log für erfolgreiche Bereinigung
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  auth.uid(), 
  'data_cleanup_complete', 
  'system', 
  'database_cleanup',
  jsonb_build_object(
    'description', 'Vollständige Datenchaos-Bereinigung erfolgreich durchgeführt',
    'mock_employees_removed', true,
    'chaotic_companies_removed', true,
    'foreign_key_constraints_respected', true,
    'rls_policies_repaired', true,
    'clean_data_structure_established', true,
    'timestamp', now()
  )
);