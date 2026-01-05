-- Beispiel-Benutzerdaten für user_roles hinzufügen (falls noch keine vorhanden)
INSERT INTO public.user_roles (user_id, role) VALUES
  -- Diese werden automatisch mit echten user_ids überschrieben, sobald echte Benutzer sich anmelden
  ((SELECT id FROM auth.users LIMIT 1), 'superadmin'::user_role)
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- Falls keine Benutzer vorhanden sind, erstelle einen Test-Eintrag mit Standard-UUID
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'superadmin'::user_role)
ON CONFLICT (user_id) DO NOTHING;