-- =====================================================
-- IMPACT MATRIX EVENTS FÜR ECHTZEIT-SYNCHRONISATION
-- =====================================================

-- Roadmap Events
INSERT INTO impact_matrix (
  action_name, effect_type, effect_category, is_active, priority
) VALUES 
  ('roadmap.created', 'notification.in_app', 'notification', true, 'P0'),
  ('roadmap.created', 'ui.live_update', 'ui', true, 'P0'),
  ('roadmap.updated', 'ui.live_update', 'ui', true, 'P1'),
  ('roadmap.updated', 'ui.list_refresh', 'ui', true, 'P1'),
  ('roadmap.deleted', 'ui.live_update', 'ui', true, 'P0')
ON CONFLICT DO NOTHING;

-- Department Events
INSERT INTO impact_matrix (
  action_name, effect_type, effect_category, is_active, priority
) VALUES
  ('department.created', 'notification.in_app', 'notification', true, 'P0'),
  ('department.created', 'ui.live_update', 'ui', true, 'P0'),
  ('department.created', 'access.permission_update', 'access', true, 'P0'),
  ('department.updated', 'ui.live_update', 'ui', true, 'P1'),
  ('department.deleted', 'access.revoke', 'access', true, 'P0'),
  ('department.deleted', 'ui.live_update', 'ui', true, 'P0')
ON CONFLICT DO NOTHING;

-- Settings/Language Events
INSERT INTO impact_matrix (
  action_name, effect_type, effect_category, is_active, priority
) VALUES
  ('settings.language_changed', 'ui.live_update', 'ui', true, 'P0'),
  ('settings.language_changed', 'cache.invalidate', 'cache', true, 'P0'),
  ('settings.updated', 'ui.live_update', 'ui', true, 'P1'),
  ('settings.updated', 'cache.refresh', 'cache', true, 'P1')
ON CONFLICT DO NOTHING;

-- Employee Events
INSERT INTO impact_matrix (
  action_name, effect_type, effect_category, is_active, priority
) VALUES
  ('employee.created', 'ui.live_update', 'ui', true, 'P0'),
  ('employee.created', 'ui.list_refresh', 'ui', true, 'P0'),
  ('employee.created', 'notification.in_app', 'notification', true, 'P1'),
  ('employee.updated', 'ui.live_update', 'ui', true, 'P1'),
  ('employee.deleted', 'ui.live_update', 'ui', true, 'P0'),
  ('employee.deleted', 'access.revoke', 'access', true, 'P0')
ON CONFLICT DO NOTHING;

-- Task Events
INSERT INTO impact_matrix (
  action_name, effect_type, effect_category, is_active, priority
) VALUES
  ('task.assigned', 'notification.push', 'notification', true, 'P0'),
  ('task.assigned', 'notification.in_app', 'notification', true, 'P0'),
  ('task.created', 'ui.live_update', 'ui', true, 'P0'),
  ('task.created', 'ui.badge_update', 'ui', true, 'P0'),
  ('task.updated', 'ui.live_update', 'ui', true, 'P1'),
  ('task.completed', 'ui.live_update', 'ui', true, 'P0'),
  ('task.completed', 'ui.progress_update', 'ui', true, 'P0'),
  ('task.deleted', 'ui.live_update', 'ui', true, 'P0')
ON CONFLICT DO NOTHING;

-- Project Events
INSERT INTO impact_matrix (
  action_name, effect_type, effect_category, is_active, priority
) VALUES
  ('project.created', 'ui.live_update', 'ui', true, 'P0'),
  ('project.created', 'notification.in_app', 'notification', true, 'P1'),
  ('project.updated', 'ui.live_update', 'ui', true, 'P1'),
  ('project.updated', 'ui.progress_update', 'ui', true, 'P1'),
  ('project.deleted', 'ui.live_update', 'ui', true, 'P0')
ON CONFLICT DO NOTHING;