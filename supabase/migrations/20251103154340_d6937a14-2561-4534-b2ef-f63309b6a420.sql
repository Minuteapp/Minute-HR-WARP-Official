-- Tenant-Modus deaktivieren: Zurück zum SuperAdmin
DELETE FROM user_tenant_sessions
WHERE user_id = '046aa705-5009-4387-b148-6646d569b9a2';