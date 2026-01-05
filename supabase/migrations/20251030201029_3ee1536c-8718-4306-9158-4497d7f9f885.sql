-- Korrektur: Mitarbeiter dürfen Mitarbeiter-Modul nicht sehen
-- Sie sollen nur ihr eigenes Profil im Profil-Modul sehen

-- 1. Setze employees-Modul für employee-Rolle auf nicht sichtbar
UPDATE public.role_permission_matrix
SET 
  is_visible = false,
  allowed_actions = '{}'
WHERE role = 'employee' 
  AND module_name IN ('employees', 'Mitarbeiter');

-- 2. Erstelle/Update Profil-Modul in role_permission_matrix
INSERT INTO public.role_permission_matrix (
  role, 
  module_name, 
  is_visible, 
  allowed_actions,
  visible_fields,
  editable_fields
) VALUES
  -- Mitarbeiter: Nur eigenes Profil sehen/bearbeiten
  ('employee', 'profil', true, '{view,edit}', '{"*": true}', '{"own_profile": true}'),
  
  -- Manager: Kann Team-Profile sehen
  ('manager', 'profil', true, '{view,edit}', '{"*": true}', '{"team_profiles": true}'),
  
  -- Admin/HR: Kann alle Profile sehen
  ('admin', 'profil', true, '{view,edit,delete}', '{"*": true}', '{"*": true}'),
  ('hr', 'profil', true, '{view,edit,delete}', '{"*": true}', '{"*": true}'),
  ('superadmin', 'profil', true, '{view,edit,delete,export}', '{"*": true}', '{"*": true}')
ON CONFLICT (role, module_name) 
DO UPDATE SET
  is_visible = EXCLUDED.is_visible,
  allowed_actions = EXCLUDED.allowed_actions,
  visible_fields = EXCLUDED.visible_fields,
  editable_fields = EXCLUDED.editable_fields;