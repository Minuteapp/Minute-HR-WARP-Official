-- FINALE DATENCHAOS BEREINIGUNG - Alle Referenzen berücksichtigen

-- SCHRITT 1: Lösche Shifts für Mock-Mitarbeiter
DELETE FROM public.shifts 
WHERE employee_id IN (
  SELECT id FROM public.employees 
  WHERE 
    name = 'Thomas Müller' OR
    name = 'Test 2 3 4 test 2 3 4' OR
    name = 'Hallo Test' OR
    name = 't' OR
    name = 'g g' OR
    name = 'Monaco Monaco' OR
    name = 'AEK  ATHEN' OR
    name ILIKE '%test%' OR 
    name ILIKE '%demo%' OR 
    email ILIKE '%test%' OR 
    name IS NULL OR 
    name = ''
);

-- SCHRITT 2: Lösche Mock-Mitarbeiter
DELETE FROM public.employees 
WHERE 
  name = 'Thomas Müller' OR
  name = 'Test 2 3 4 test 2 3 4' OR
  name = 'Hallo Test' OR
  name = 't' OR
  name = 'g g' OR
  name = 'Monaco Monaco' OR
  name = 'AEK  ATHEN' OR
  name ILIKE '%test%' OR 
  name ILIKE '%demo%' OR 
  email ILIKE '%test%' OR 
  name IS NULL OR 
  name = '';

-- SCHRITT 3: Lösche Goals der SVH Firma
DELETE FROM public.goals 
WHERE company_id IN (
  SELECT id FROM public.companies WHERE name ILIKE '%svh%'
);

-- SCHRITT 4: Lösche SVH GmbH Firma
DELETE FROM public.companies 
WHERE name ILIKE '%svh%';

-- SCHRITT 5: Bereinige User-Rollen
DELETE FROM public.user_roles 
WHERE user_id NOT IN (SELECT id FROM public.employees WHERE id IS NOT NULL)
AND user_id != 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid;

-- SCHRITT 6: Erfolg protokollieren
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid, 
  'final_cleanup_success', 
  'system', 
  'database_cleanup',
  jsonb_build_object(
    'description', 'Datenchaos ENDLICH vollständig bereinigt!',
    'shifts_removed', true,
    'mock_employees_removed', true,
    'goals_removed', true,
    'svh_company_removed', true,
    'user_roles_cleaned', true,
    'all_foreign_keys_respected', true,
    'timestamp', now()
  )
);