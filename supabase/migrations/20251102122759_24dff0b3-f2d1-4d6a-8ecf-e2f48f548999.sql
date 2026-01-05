-- Test-User für Isolation-Tests anlegen (korrigiert)

-- Test-Admin für neue Firma
-- Email: test-admin@test-isolation.de, Passwort: TestAdmin123!
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at
) VALUES (
  'bbbbbbbb-1111-2222-3333-aaaaaaaaaaaa',
  '00000000-0000-0000-0000-000000000000',
  'test-admin@test-isolation.de',
  crypt('TestAdmin123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object('role', 'admin', 'company_id', 'aaaaaaaa-bbbb-cccc-dddd-111111111111'),
  'authenticated',
  'authenticated',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Rolle für Test-Admin
INSERT INTO user_roles (user_id, role, company_id)
VALUES (
  'bbbbbbbb-1111-2222-3333-aaaaaaaaaaaa',
  'admin',
  'aaaaaaaa-bbbb-cccc-dddd-111111111111'
) ON CONFLICT DO NOTHING;

-- Test-Employee für neue Firma
-- Email: test-employee@test-isolation.de, Passwort: TestEmployee123!
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at
) VALUES (
  'cccccccc-2222-3333-4444-bbbbbbbbbbbb',
  '00000000-0000-0000-0000-000000000000',
  'test-employee@test-isolation.de',
  crypt('TestEmployee123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object('role', 'employee', 'company_id', 'aaaaaaaa-bbbb-cccc-dddd-111111111111'),
  'authenticated',
  'authenticated',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Rolle für Test-Employee
INSERT INTO user_roles (user_id, role, company_id)
VALUES (
  'cccccccc-2222-3333-4444-bbbbbbbbbbbb',
  'employee',
  'aaaaaaaa-bbbb-cccc-dddd-111111111111'
) ON CONFLICT DO NOTHING;

-- Employee-Profil für Test-Employee anlegen (ohne user_id Spalte)
INSERT INTO employees (
  id,
  company_id,
  first_name,
  last_name,
  email,
  name,
  status,
  role,
  created_at
) VALUES (
  'dddddddd-3333-4444-5555-cccccccccccc',
  'aaaaaaaa-bbbb-cccc-dddd-111111111111',
  'Test',
  'Employee',
  'test-employee@test-isolation.de',
  'Test Employee',
  'active',
  'employee',
  NOW()
) ON CONFLICT DO NOTHING;