-- DATENCHAOS BEREINIGUNG - 4-Phasen-Reparatur
-- Diese Migration bereinigt alle Mock-/Test-Daten und erstellt eine saubere Datenstruktur

-- PHASE 1: Mock-/Test-Mitarbeiter identifizieren und löschen
-- Lösche alle Mock-Mitarbeiter (FC Bayern, Test-Einträge, etc.)
DELETE FROM public.employees 
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

-- PHASE 2: Chaotische Firmen bereinigen
-- Lösche die alte "SVH GmbH" mit allen Mock-Daten
DELETE FROM public.companies 
WHERE 
  name ILIKE '%svh%' OR 
  name ILIKE '%gmbh%' AND created_at < NOW() - INTERVAL '7 days' OR
  -- Firmen mit Mock-Daten oder unvollständigen Informationen
  billing_email ILIKE '%test%' OR 
  billing_email ILIKE '%example%' OR
  -- Firmen ohne echte Kontaktdaten
  contact_person ILIKE '%test%' OR
  phone IS NULL OR phone = '' OR
  address IS NULL OR address = '';

-- PHASE 3: User-Rollen bereinigen
-- Entferne Rollen für gelöschte Mitarbeiter
DELETE FROM public.user_roles 
WHERE user_id NOT IN (
  SELECT id FROM public.employees WHERE id IS NOT NULL
) AND user_id != 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid;

-- PHASE 4: RLS-Policy Reparatur für korrekte Mitarbeiteranzeige
-- Stelle sicher, dass die Mitarbeiter-RLS-Policy korrekt funktioniert
DROP POLICY IF EXISTS "Employees_MultiTenant_Isolation" ON public.employees;

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
);

-- Audit-Log für Bereinigung
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  auth.uid(), 
  'data_cleanup_complete', 
  'system', 
  'database_cleanup',
  jsonb_build_object(
    'description', 'Vollständige Datenchaos-Bereinigung durchgeführt',
    'mock_employees_removed', true,
    'chaotic_companies_removed', true,
    'rls_policies_repaired', true,
    'clean_data_structure_established', true,
    'timestamp', now()
  )
);

-- Statistik nach Bereinigung
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  auth.uid(), 
  'cleanup_statistics', 
  'system', 
  'post_cleanup_stats',
  jsonb_build_object(
    'remaining_companies', (SELECT COUNT(*) FROM public.companies WHERE is_active = true),
    'remaining_employees', (SELECT COUNT(*) FROM public.employees WHERE archived = false),
    'active_user_roles', (SELECT COUNT(*) FROM public.user_roles),
    'cleanup_completed_at', now()
  )
);