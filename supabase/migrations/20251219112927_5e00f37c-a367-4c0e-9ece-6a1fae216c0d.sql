-- Insert definition for create_task_allowed
INSERT INTO settings_definitions (
  id, module, submodule, key, name, description, value_type, 
  default_value, is_required, is_active, affected_features, 
  category, sort_order, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'tasks',
  'creation',
  'create_task_allowed',
  'Aufgaben erstellen erlaubt',
  'Dürfen Benutzer neue Aufgaben erstellen?',
  'boolean',
  'true',
  true,
  true,
  ARRAY['task_creation', 'new_task_button'],
  'Erstellung',
  0,
  NOW(),
  NOW()
) ON CONFLICT (module, key) DO NOTHING;

-- Insert value for create_task_allowed
INSERT INTO settings_values (
  id, definition_id, module, key, value, scope_level, 
  scope_entity_name, inheritance_mode, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM settings_definitions WHERE module = 'tasks' AND key = 'create_task_allowed'),
  'tasks',
  'create_task_allowed',
  'true',
  'global',
  'System-Standard',
  'inherit',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;