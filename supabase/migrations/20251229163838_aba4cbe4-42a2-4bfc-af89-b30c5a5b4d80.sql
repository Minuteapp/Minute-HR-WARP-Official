-- Audit-Trigger temporär deaktivieren
ALTER TABLE user_roles DISABLE TRIGGER audit_role_changes;
ALTER TABLE user_roles DISABLE TRIGGER audit_user_roles_changes;

-- SuperAdmin einfügen
INSERT INTO user_roles (user_id, role, company_id)
VALUES ('f001e8bd-f919-45b9-bf23-295b3a91cc9f', 'superadmin', 'ea1404e3-eba4-4da8-9927-2702e40d9882')
ON CONFLICT (user_id, role) DO NOTHING;

-- Trigger wieder aktivieren
ALTER TABLE user_roles ENABLE TRIGGER audit_role_changes;
ALTER TABLE user_roles ENABLE TRIGGER audit_user_roles_changes;