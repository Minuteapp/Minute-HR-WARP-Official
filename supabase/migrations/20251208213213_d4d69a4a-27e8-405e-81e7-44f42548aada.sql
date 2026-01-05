-- Füge das knowledge-hub Modul zur permission_modules Tabelle hinzu
INSERT INTO permission_modules (name, module_key, description, is_active, module_type, icon, color)
VALUES ('Wissensdatenbank', 'knowledge-hub', 'Knowledge Hub, Artikel-Verwaltung und AI Governance', true, 'main', 'BookOpen', '#3B82F6')
ON CONFLICT (module_key) DO NOTHING;

-- Füge Berechtigungen für alle Rollen in role_permission_matrix hinzu
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions)
VALUES 
  ('superadmin', 'knowledge-hub', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('admin', 'knowledge-hub', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('hr', 'knowledge-hub', true, ARRAY['view', 'create', 'edit', 'approve']),
  ('hr_manager', 'knowledge-hub', true, ARRAY['view', 'create', 'edit', 'approve']),
  ('manager', 'knowledge-hub', true, ARRAY['view', 'create', 'edit']),
  ('employee', 'knowledge-hub', true, ARRAY['view'])
ON CONFLICT DO NOTHING;