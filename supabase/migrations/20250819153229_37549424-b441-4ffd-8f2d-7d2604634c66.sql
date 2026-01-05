-- Setze die Rolle auf superadmin für den bestehenden Admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"superadmin"')
WHERE email = 'daniel.haeuslein@live.de';

-- Stelle sicher, dass auch der user_roles Eintrag korrekt ist
INSERT INTO public.user_roles (user_id, role, company_id)
SELECT 
    id as user_id,
    'superadmin'::user_role as role,
    (raw_user_meta_data->>'company_id')::uuid as company_id
FROM auth.users 
WHERE email = 'daniel.haeuslein@live.de'
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';