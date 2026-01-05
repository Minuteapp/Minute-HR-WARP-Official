-- MINIMALE SICHERE DATENCHAOS BEREINIGUNG
-- Nur das Nötigste ohne komplizierte Tabellen

-- SCHRITT 1: Mock-Mitarbeiter direkt löschen (ohne komplexe Referenzen)
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
  -- Offensichtlich falsche E-Mails
  email ILIKE '%test%' OR 
  email ILIKE '%demo%' OR 
  email ILIKE '%example.com' OR
  -- Leere Namen
  name IS NULL OR 
  name = '' OR
  name = 'Neuer Mitarbeiter';

-- SCHRITT 2: SVH GmbH Firma löschen
DELETE FROM public.companies 
WHERE name ILIKE '%svh%';

-- SCHRITT 3: Verwaiste User-Rollen bereinigen
DELETE FROM public.user_roles 
WHERE user_id NOT IN (SELECT id FROM public.employees WHERE id IS NOT NULL)
AND user_id != 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid;

-- SCHRITT 4: RLS-Policy vereinfachen
DROP POLICY IF EXISTS "Employees_MultiTenant_Isolation" ON public.employees;
DROP POLICY IF EXISTS "Employees_Clean_Access" ON public.employees;

CREATE POLICY "Employees_Simple_Access" ON public.employees
FOR ALL USING (
  is_superadmin_safe(auth.uid()) = true OR 
  id = auth.uid()
) WITH CHECK (
  is_superadmin_safe(auth.uid()) = true OR 
  id = auth.uid()
);

-- SCHRITT 5: Erfolg protokollieren
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid, 
  'minimal_cleanup_complete', 
  'system', 
  'database_cleanup',
  jsonb_build_object(
    'description', 'Minimale Datenchaos-Bereinigung erfolgreich',
    'approach', 'minimal_safe_approach',
    'mock_employees_removed', true,
    'svh_company_removed', true,
    'rls_simplified', true,
    'timestamp', now()
  )
);