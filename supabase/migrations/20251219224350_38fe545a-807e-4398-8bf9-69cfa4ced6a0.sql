-- Fehlende employees-Einträge für Test-Nutzer erstellen (inkl. name-Spalte)
INSERT INTO employees (user_id, company_id, first_name, last_name, name, email, status)
SELECT 
  p.id as user_id,
  'a581a8b5-3b4d-4ed9-a565-103cd5cdbd44' as company_id,
  COALESCE(SPLIT_PART(TRIM(p.full_name), ' ', 1), 'Test') as first_name,
  COALESCE(NULLIF(SPLIT_PART(TRIM(p.full_name), ' ', 2), ''), 'Nutzer') as last_name,
  COALESCE(TRIM(p.full_name), 'Test Nutzer') as name,
  au.email,
  'active' as status
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.id IN (
  '1228e800-8da5-4750-86a5-d27efa8d2bd1',
  'f6b25a08-7dd1-418e-830f-3f8bcbcd4acf',
  '0f1037ea-e5ed-4aec-81a9-f88aee9ff7b6',
  'd7b964ea-3e08-4436-a8c5-813d76389c12',
  'f4f92d3d-9eae-4813-9b65-f28465b969d7'
)
AND NOT EXISTS (
  SELECT 1 FROM employees e WHERE e.user_id = p.id
);