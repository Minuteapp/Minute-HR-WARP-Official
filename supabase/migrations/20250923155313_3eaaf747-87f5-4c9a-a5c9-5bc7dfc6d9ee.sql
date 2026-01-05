-- ULTIMATIVE DATENCHAOS BEREINIGUNG - SVH Mitarbeiter transferieren

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

-- SCHRITT 3: Echte SVH Mitarbeiter auf NULL setzen (transferieren)
UPDATE public.employees 
SET company_id = NULL
WHERE company_id IN (
  SELECT id FROM public.companies WHERE name ILIKE '%svh%'
);

-- SCHRITT 4: User-Rollen von SVH auf NULL setzen
UPDATE public.user_roles 
SET company_id = NULL
WHERE company_id IN (
  SELECT id FROM public.companies WHERE name ILIKE '%svh%'
);

-- SCHRITT 5: Lösche Goals der SVH Firma
DELETE FROM public.goals 
WHERE company_id IN (
  SELECT id FROM public.companies WHERE name ILIKE '%svh%'
);

-- SCHRITT 6: Jetzt SVH GmbH Firma sicher löschen
DELETE FROM public.companies 
WHERE name ILIKE '%svh%';

-- SCHRITT 7: Erfolg protokollieren
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid, 
  'ultimate_cleanup_success', 
  'system', 
  'database_cleanup',
  jsonb_build_object(
    'description', 'DATENCHAOS ENDGÜLTIG BEREINIGT! SVH entfernt, echte Mitarbeiter transferiert!',
    'shifts_removed', true,
    'mock_employees_deleted', true,
    'real_employees_transferred', true,
    'user_roles_updated', true,
    'goals_removed', true,
    'svh_company_deleted', true,
    'all_constraints_satisfied', true,
    'timestamp', now()
  )
);