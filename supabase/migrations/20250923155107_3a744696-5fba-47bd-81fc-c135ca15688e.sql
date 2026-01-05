-- DATENCHAOS BEREINIGUNG - Korrekte Reihenfolge: Shifts zuerst!

-- SCHRITT 1: Lösche Shifts für Mock-Mitarbeiter
DELETE FROM public.shifts 
WHERE employee_id IN (
  SELECT id FROM public.employees 
  WHERE 
    -- FC Bayern Mock-Daten
    name ILIKE '%bayern%' OR 
    name ILIKE '%müller%' OR 
    name ILIKE '%neuer%' OR 
    name ILIKE '%lewandowski%' OR
    name = 'Thomas Müller' OR
    -- Test-Einträge
    name ILIKE '%test%' OR 
    name ILIKE '%demo%' OR 
    name ILIKE '%example%' OR
    name = 'Test 2 3 4 test 2 3 4' OR
    name = 'Hallo Test' OR
    -- Offensichtlich falsche Namen
    name = 't' OR
    name = 'g g' OR
    name = 'Monaco Monaco' OR
    name = 'AEK  ATHEN' OR
    -- Falsche E-Mails
    email ILIKE '%test%' OR 
    email ILIKE '%demo%' OR 
    email ILIKE '%example.com' OR
    -- Leere Namen
    name IS NULL OR 
    name = '' OR
    name = 'Neuer Mitarbeiter'
);

-- SCHRITT 2: Lösche Mock-Mitarbeiter (jetzt ohne Foreign Key Konflikte)
DELETE FROM public.employees 
WHERE 
  -- FC Bayern Mock-Daten
  name ILIKE '%bayern%' OR 
  name ILIKE '%müller%' OR 
  name ILIKE '%neuer%' OR 
  name ILIKE '%lewandowski%' OR
  name = 'Thomas Müller' OR
  -- Test-Einträge
  name ILIKE '%test%' OR 
  name ILIKE '%demo%' OR 
  name ILIKE '%example%' OR
  name = 'Test 2 3 4 test 2 3 4' OR
  name = 'Hallo Test' OR
  -- Offensichtlich falsche Namen
  name = 't' OR
  name = 'g g' OR
  name = 'Monaco Monaco' OR
  name = 'AEK  ATHEN' OR
  -- Falsche E-Mails
  email ILIKE '%test%' OR 
  email ILIKE '%demo%' OR 
  email ILIKE '%example.com' OR
  -- Leere Namen
  name IS NULL OR 
  name = '' OR
  name = 'Neuer Mitarbeiter';

-- SCHRITT 3: Lösche SVH GmbH Firma
DELETE FROM public.companies 
WHERE name ILIKE '%svh%';

-- SCHRITT 4: Bereinige verwaiste User-Rollen
DELETE FROM public.user_roles 
WHERE user_id NOT IN (SELECT id FROM public.employees WHERE id IS NOT NULL)
AND user_id != 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid;

-- SCHRITT 5: Erfolg protokollieren
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid, 
  'complete_cleanup_success', 
  'system', 
  'database_cleanup',
  jsonb_build_object(
    'description', 'Datenchaos vollständig bereinigt - Shifts und Mock-Mitarbeiter gelöscht',
    'shifts_removed', true,
    'mock_employees_removed', true,
    'svh_company_removed', true,
    'user_roles_cleaned', true,
    'foreign_key_constraints_respected', true,
    'timestamp', now()
  )
);