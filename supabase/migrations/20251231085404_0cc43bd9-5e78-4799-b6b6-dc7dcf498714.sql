-- Impact Matrix erweitern - nur für bereits registrierte Actions
-- Erst effect_types hinzufügen
INSERT INTO effect_types (effect_type, category, description, description_de, handler_function, is_active)
VALUES 
  ('ui.calendar_update', 'ui', 'Update calendar view', 'Kalender-Ansicht aktualisieren', 'handle_calendar_update', true),
  ('ui.progress_update', 'ui', 'Update progress indicator', 'Fortschrittsanzeige aktualisieren', 'handle_progress_update', true)
ON CONFLICT (effect_type) DO NOTHING;

-- Nur Actions einfügen die in action_registry existieren
INSERT INTO impact_matrix (action_name, effect_type, effect_category, target_resolution_rule, priority, execution_mode, is_active)
SELECT ar.action_name, v.effect_type, v.effect_category, v.target_resolution_rule::jsonb, v.priority, v.execution_mode, true
FROM action_registry ar
CROSS JOIN (VALUES 
  ('document.uploaded', 'notification.in_app', 'notification', '{"type": "approver"}', 'P1', 'async'),
  ('document.uploaded', 'ui.badge_update', 'ui', '{"type": "uploader"}', 'P0', 'sync'),
  ('document.approved', 'notification.in_app', 'notification', '{"type": "uploader"}', 'P1', 'async'),
  ('document.rejected', 'notification.in_app', 'notification', '{"type": "uploader"}', 'P0', 'async'),
  ('task.updated', 'notification.in_app', 'notification', '{"type": "assigned_user"}', 'P2', 'async'),
  ('task.updated', 'ui.live_update', 'ui', '{"type": "watchers"}', 'P0', 'sync'),
  ('task.deleted', 'notification.in_app', 'notification', '{"type": "assigned_user"}', 'P2', 'async'),
  ('task.deleted', 'ui.badge_update', 'ui', '{"type": "assigned_user"}', 'P0', 'sync'),
  ('project.created', 'notification.in_app', 'notification', '{"type": "team_members"}', 'P1', 'async'),
  ('project.created', 'ui.badge_update', 'ui', '{"type": "owner"}', 'P0', 'sync'),
  ('project.updated', 'notification.in_app', 'notification', '{"type": "team_members"}', 'P2', 'async'),
  ('shift.created', 'notification.in_app', 'notification', '{"type": "assigned_employee"}', 'P1', 'async'),
  ('shift.assigned', 'notification.in_app', 'notification', '{"type": "assigned_employee"}', 'P0', 'async'),
  ('workflow.started', 'notification.in_app', 'notification', '{"type": "first_approver"}', 'P1', 'async'),
  ('workflow.completed', 'notification.in_app', 'notification', '{"type": "initiator"}', 'P0', 'async'),
  ('expense.created', 'notification.in_app', 'notification', '{"type": "finance_team"}', 'P2', 'async'),
  ('expense.approved', 'notification.in_app', 'notification', '{"type": "submitter"}', 'P1', 'async'),
  ('ticket.created', 'notification.in_app', 'notification', '{"type": "support_team"}', 'P1', 'async'),
  ('ticket.resolved', 'notification.in_app', 'notification', '{"type": "requester"}', 'P0', 'async')
) AS v(action_name, effect_type, effect_category, target_resolution_rule, priority, execution_mode)
WHERE ar.action_name = v.action_name
ON CONFLICT (action_name, effect_type) DO NOTHING;