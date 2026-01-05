-- SYSTEM REPARATUR (KORRIGIERT): Erst Shifts bereinigen, dann Mitarbeiter Firmen zuordnen

-- SCHRITT 1: Lösche Shifts von Mock-Mitarbeitern (die wir löschen wollen)
DELETE FROM public.shifts 
WHERE employee_id IN (
  SELECT id FROM public.employees 
  WHERE 
    name IN ('0000 00000', 'FC Augsburg  1904', 'FC Bayern  München', 'Hallo Du', 'SVH SVH', 'xxx xxx', 'Sophia Victoria') OR
    email IN ('', ' ') OR
    (first_name IN ('0000', 'FC Augsburg', 'FC Bayern', 'xxx', 'SVH', 'Sophia') AND last_name IN ('00000', '1904', 'München', 'xxx', 'SVH', 'Victoria'))
);

-- SCHRITT 2: Jetzt Mock/Test-Mitarbeiter sicher löschen  
DELETE FROM public.employees 
WHERE 
  name IN ('0000 00000', 'FC Augsburg  1904', 'FC Bayern  München', 'Hallo Du', 'SVH SVH', 'xxx xxx', 'Sophia Victoria') OR
  email IN ('', ' ') OR
  (first_name IN ('0000', 'FC Augsburg', 'FC Bayern', 'xxx', 'SVH', 'Sophia') AND last_name IN ('00000', '1904', 'München', 'xxx', 'SVH', 'Victoria'));

-- SCHRITT 3: Daniel Häuslein (Hiprocall E-Mail) → Hiprocall GmbH
UPDATE public.employees 
SET company_id = (SELECT id FROM public.companies WHERE name = 'Hiprocall GmbH')
WHERE email = 'd.haeuslein@hiprocall.de';

-- SCHRITT 4: Daniel Häuslein (Minute Labs E-Mail) → Minute Labs GmbH  
UPDATE public.employees 
SET company_id = (SELECT id FROM public.companies WHERE name = 'Minute Labs GmbH')
WHERE email = 'minuteapp@outlook.de';

-- SCHRITT 5: Steffi Poulios → Hiprocall GmbH 
UPDATE public.employees 
SET company_id = (SELECT id FROM public.companies WHERE name = 'Hiprocall GmbH')
WHERE email = 'steffi.poulios@gmail.com';

-- SCHRITT 6: Daniel private E-Mail → Hiprocall GmbH
UPDATE public.employees 
SET company_id = (SELECT id FROM public.companies WHERE name = 'Hiprocall GmbH')
WHERE email = 'daniel.haeuslein@live.de';

-- SCHRITT 7: Max Mustermann → Testfirma Clean
UPDATE public.employees 
SET company_id = (SELECT id FROM public.companies WHERE name = 'Testfirma Clean')
WHERE name = 'Max Mustermann' AND email = 'max.muster@muster.de';

-- SCHRITT 8: Anna Beata → Minute Labs GmbH (als Demo)
UPDATE public.employees 
SET company_id = (SELECT id FROM public.companies WHERE name = 'Minute Labs GmbH')
WHERE email = 'NN.be@abc.de';

-- SCHRITT 9: User-Rollen entsprechend korrigieren
UPDATE public.user_roles 
SET company_id = (
  SELECT e.company_id FROM public.employees e WHERE e.id = user_roles.user_id
)
WHERE user_id IN (
  SELECT id FROM public.employees WHERE company_id IS NOT NULL
);

-- SCHRITT 10: Protokollierung
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid, 
  'system_repair_complete', 
  'system', 
  'database_restoration',
  jsonb_build_object(
    'description', 'System vollständig repariert - Mitarbeiter wieder Firmen zugeordnet',
    'shifts_cleaned', true,
    'mock_employees_removed', true,
    'real_employees_reassigned', true,
    'user_roles_synchronized', true,
    'timestamp', now()
  )
);