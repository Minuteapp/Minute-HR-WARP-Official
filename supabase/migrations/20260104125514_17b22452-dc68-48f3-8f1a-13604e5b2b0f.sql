-- Korrigiere falsche Rollen-Keys in role_permission_matrix
UPDATE role_permission_matrix 
SET role = 'team_lead' 
WHERE role = 'teamlead';

UPDATE role_permission_matrix 
SET role = 'hr_admin' 
WHERE role IN ('hr_manager', 'manager');

-- Entferne eventuelle Duplikate (behalte neuesten Eintrag)
DELETE FROM role_permission_matrix a
USING role_permission_matrix b
WHERE a.id < b.id 
  AND a.role = b.role 
  AND a.module_name = b.module_name
  AND a.company_id = b.company_id;