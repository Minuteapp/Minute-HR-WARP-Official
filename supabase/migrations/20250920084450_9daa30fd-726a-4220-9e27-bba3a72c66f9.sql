-- Setze den SuperAdmin Benutzer korrekt in der user_roles Tabelle
INSERT INTO user_roles (user_id, role, company_id) 
VALUES ('e7219c39-dbe0-45f3-a6b8-cbbf20517bb2', 'superadmin', NULL)
ON CONFLICT (user_id, role) DO NOTHING;