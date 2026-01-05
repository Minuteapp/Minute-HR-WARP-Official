-- Standard-Berechtigungen für Objectives-Modul hinzufügen
WITH objectives_module AS (
  SELECT id FROM permission_modules WHERE module_key = 'objectives'
)
INSERT INTO role_permissions (role, module_id, action, scope, is_granted)
SELECT 
  'employee',
  objectives_module.id,
  'view'::permission_action,
  'own'::permission_scope,
  true
FROM objectives_module
UNION ALL
SELECT 
  'employee',
  objectives_module.id,
  'create'::permission_action,
  'own'::permission_scope,
  true
FROM objectives_module
UNION ALL
SELECT 
  'employee',
  objectives_module.id,
  'edit'::permission_action,
  'own'::permission_scope,
  true
FROM objectives_module
UNION ALL
SELECT 
  'admin',
  objectives_module.id,
  'view'::permission_action,
  'global'::permission_scope,
  true
FROM objectives_module
UNION ALL
SELECT 
  'admin',
  objectives_module.id,
  'create'::permission_action,
  'global'::permission_scope,
  true
FROM objectives_module
UNION ALL
SELECT 
  'admin',
  objectives_module.id,
  'edit'::permission_action,
  'global'::permission_scope,
  true
FROM objectives_module
UNION ALL
SELECT 
  'admin',
  objectives_module.id,
  'delete'::permission_action,
  'global'::permission_scope,
  true
FROM objectives_module
UNION ALL
SELECT 
  'admin',
  objectives_module.id,
  'approve'::permission_action,
  'global'::permission_scope,
  true
FROM objectives_module
UNION ALL
SELECT 
  'superadmin',
  objectives_module.id,
  'view'::permission_action,
  'global'::permission_scope,
  true
FROM objectives_module
UNION ALL
SELECT 
  'superadmin',
  objectives_module.id,
  'create'::permission_action,
  'global'::permission_scope,
  true
FROM objectives_module
UNION ALL
SELECT 
  'superadmin',
  objectives_module.id,
  'edit'::permission_action,
  'global'::permission_scope,
  true
FROM objectives_module
UNION ALL
SELECT 
  'superadmin',
  objectives_module.id,
  'delete'::permission_action,
  'global'::permission_scope,
  true
FROM objectives_module
UNION ALL
SELECT 
  'superadmin',
  objectives_module.id,
  'approve'::permission_action,
  'global'::permission_scope,
  true
FROM objectives_module
ON CONFLICT (role, module_id, action, scope) DO NOTHING;