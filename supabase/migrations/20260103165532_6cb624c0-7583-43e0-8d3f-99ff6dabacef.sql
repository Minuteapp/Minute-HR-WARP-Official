-- SuperAdmin-Rolle wiederherstellen
UPDATE user_roles 
SET role = 'superadmin',
    company_id = NULL
WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2';