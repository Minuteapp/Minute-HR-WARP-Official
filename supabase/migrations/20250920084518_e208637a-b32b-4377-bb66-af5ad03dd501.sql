-- Setze den SuperAdmin Benutzer in der user_roles Tabelle ohne ON CONFLICT
-- Prüfe zuerst, ob der Eintrag bereits existiert
INSERT INTO user_roles (user_id, role, company_id) 
SELECT 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2', 'superadmin', NULL
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2' 
    AND role = 'superadmin'
);