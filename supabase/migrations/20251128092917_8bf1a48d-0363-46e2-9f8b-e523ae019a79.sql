-- Füge user_roles Eintrag für den Development-Admin hinzu
INSERT INTO user_roles (user_id, company_id, role)
SELECT 
  'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid 
  AND company_id = '00000000-0000-0000-0000-000000000001'::uuid
);