-- Settings-Modul für employee auf sichtbar setzen (konsistent mit Sidebar-Anzeige)
UPDATE public.role_permission_matrix 
SET is_visible = true, 
    allowed_actions = COALESCE(allowed_actions, ARRAY['view'])
WHERE role = 'employee' AND module_name = 'settings';

-- Falls kein Eintrag existiert, erstelle ihn (ohne description-Spalte)
INSERT INTO public.role_permission_matrix (role, module_name, is_visible, allowed_actions)
SELECT 'employee', 'settings', true, ARRAY['view']
WHERE NOT EXISTS (
  SELECT 1 FROM public.role_permission_matrix 
  WHERE role = 'employee' AND module_name = 'settings'
);