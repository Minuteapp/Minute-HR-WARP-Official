-- Lösche alle Mock-up und Test-Daten für saubere Tenant-Isolation
-- KORREKTE REIHENFOLGE: Erst abhängige Daten, dann Hauptdaten

-- 1. Identifiziere Test-Firmen die gelöscht werden sollen
WITH test_companies AS (
  SELECT id FROM companies WHERE 
    id = '00000000-0000-0000-0000-000000000001' -- Legacy System Data
    OR name ILIKE '%test%' 
    OR name ILIKE '%mock%'
    OR name = 'ejfojjegjegjeg'
    OR name = 'bayern ag'
    OR slug LIKE '%test%'
    OR is_active = false
)
-- Lösche zuerst projects von Test-Firmen
DELETE FROM projects WHERE company_id IN (SELECT id FROM test_companies);

-- 2. Lösche tasks von employees der Test-Firmen
WITH test_companies AS (
  SELECT id FROM companies WHERE 
    id = '00000000-0000-0000-0000-000000000001'
    OR name ILIKE '%test%' 
    OR name ILIKE '%mock%'
    OR name = 'ejfojjegjegjeg'
    OR name = 'bayern ag'
    OR slug LIKE '%test%'
    OR is_active = false
),
test_employees AS (
  SELECT e.id FROM employees e 
  WHERE e.company_id IN (SELECT id FROM test_companies) OR e.company_id IS NULL
)
DELETE FROM tasks WHERE user_id IN (SELECT id FROM test_employees) 
  OR (assigned_to IS NOT NULL AND assigned_to IN (SELECT id FROM test_employees));

-- 3. Lösche time_entries von employees der Test-Firmen
WITH test_companies AS (
  SELECT id FROM companies WHERE 
    id = '00000000-0000-0000-0000-000000000001'
    OR name ILIKE '%test%' 
    OR name ILIKE '%mock%'
    OR name = 'ejfojjegjegjeg'
    OR name = 'bayern ag'
    OR slug LIKE '%test%'
    OR is_active = false
),
test_employees AS (
  SELECT e.id FROM employees e 
  WHERE e.company_id IN (SELECT id FROM test_companies) OR e.company_id IS NULL
)
DELETE FROM time_entries WHERE user_id IN (SELECT id FROM test_employees);

-- 4. Lösche absence_requests von employees der Test-Firmen
WITH test_companies AS (
  SELECT id FROM companies WHERE 
    id = '00000000-0000-0000-0000-000000000001'
    OR name ILIKE '%test%' 
    OR name ILIKE '%mock%'
    OR name = 'ejfojjegjegjeg'
    OR name = 'bayern ag'
    OR slug LIKE '%test%'
    OR is_active = false
),
test_employees AS (
  SELECT e.id FROM employees e 
  WHERE e.company_id IN (SELECT id FROM test_companies) OR e.company_id IS NULL
)
DELETE FROM absence_requests WHERE user_id IN (SELECT id FROM test_employees);

-- 5. Lösche employees von Test-Firmen und verwaiste ohne company_id
DELETE FROM employees WHERE 
  company_id IS NULL 
  OR company_id IN (
    SELECT id FROM companies WHERE 
      id = '00000000-0000-0000-0000-000000000001'
      OR name ILIKE '%test%' 
      OR name ILIKE '%mock%'
      OR name = 'ejfojjegjegjeg'
      OR name = 'bayern ag'
      OR slug LIKE '%test%'
      OR is_active = false
  );

-- 6. Jetzt können wir die Test-Firmen löschen
DELETE FROM companies WHERE 
  id = '00000000-0000-0000-0000-000000000001' -- Legacy System Data
  OR name ILIKE '%test%' 
  OR name ILIKE '%mock%'
  OR name = 'ejfojjegjegjeg'
  OR name = 'bayern ag'
  OR slug LIKE '%test%'
  OR is_active = false;