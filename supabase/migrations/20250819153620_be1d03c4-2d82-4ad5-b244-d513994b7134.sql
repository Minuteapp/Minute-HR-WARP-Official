-- Temporäres Passwort für den Superadmin setzen
-- Das Passwort wird 'TempPass2025!' sein
UPDATE auth.users 
SET encrypted_password = crypt('TempPass2025!', gen_salt('bf'))
WHERE email = 'daniel.haeuslein@live.de';