-- Test 1: User-Rollen korrigieren und Test-Firma anlegen

-- 1. Neue Test-Firma für Isolation-Tests anlegen
INSERT INTO companies (id, name, slug, created_at)
VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-111111111111',
  'Test Isolation Firma',
  'test-isolation-firma',
  NOW()
);

-- 2. User-Rollen ohne company_id der Development-Firma zuordnen
-- (alle außer minuteapp@outlook.de, der schon eine hat)
UPDATE user_roles
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL
AND user_id != 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2';

-- 3. Test-Admin-User für neue Firma anlegen
-- Email: test-admin@test-isolation.de
-- Passwort: TestAdmin123!
-- Wird manuell über Supabase Auth erstellt, hier nur Rolle vorbereiten
-- HINWEIS: User-ID wird nach Erstellung in auth.users eingefügt

-- 4. Test-Employee-User für neue Firma vorbereiten
-- Email: test-employee@test-isolation.de
-- Passwort: TestEmployee123!
-- HINWEIS: User-ID wird nach Erstellung in auth.users eingefügt