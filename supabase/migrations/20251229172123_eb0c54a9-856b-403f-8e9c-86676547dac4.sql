-- Impact Matrix Population mit korrekten Werten
-- failure_handling erlaubt: retry, skip, escalate, dead_letter

INSERT INTO impact_matrix (action_name, effect_type, effect_category, target_resolution_rule, conditions, priority, execution_mode, retry_policy, failure_handling) VALUES

-- ==================== TASK MODULE ====================
('task.created', 'notification.in_app', 'notification', '{"type": "assigned_user"}', '{"has_assigned_user": true}', 'P1', 'async', '{"max_attempts": 3, "backoff": "exponential"}', 'retry'),
('task.created', 'ui.badge_update', 'ui', '{"type": "assigned_user"}', NULL, 'P0', 'sync', '{"max_attempts": 1}', 'skip'),
('task.assigned', 'notification.in_app', 'notification', '{"type": "assigned_user"}', NULL, 'P1', 'async', '{"max_attempts": 3, "backoff": "exponential"}', 'retry'),
('task.assigned', 'notification.email', 'notification', '{"type": "assigned_user"}', NULL, 'P2', 'async', '{"max_attempts": 5, "backoff": "exponential"}', 'retry'),
('task.assigned', 'ui.badge_update', 'ui', '{"type": "assigned_user"}', NULL, 'P0', 'sync', '{"max_attempts": 1}', 'skip'),
('task.status_changed', 'notification.in_app', 'notification', '{"type": "actor"}', '{"status_is": "completed"}', 'P2', 'async', '{"max_attempts": 3}', 'skip'),
('task.status_changed', 'ui.live_update', 'ui', '{"type": "team"}', NULL, 'P0', 'sync', '{"max_attempts": 1}', 'skip'),
('task.completed', 'notification.in_app', 'notification', '{"type": "manager"}', NULL, 'P2', 'async', '{"max_attempts": 3}', 'skip'),
('task.completed', 'ui.badge_update', 'ui', '{"type": "assigned_user"}', NULL, 'P0', 'sync', '{"max_attempts": 1}', 'skip'),
('task.due_date_changed', 'notification.in_app', 'notification', '{"type": "assigned_user"}', NULL, 'P1', 'async', '{"max_attempts": 3}', 'skip'),
('task.comment_added', 'notification.in_app', 'notification', '{"type": "assigned_user"}', NULL, 'P2', 'async', '{"max_attempts": 3}', 'skip'),

-- ==================== ABSENCE MODULE ====================
('absence.requested', 'notification.in_app', 'notification', '{"type": "manager"}', NULL, 'P1', 'async', '{"max_attempts": 3}', 'retry'),
('absence.requested', 'notification.email', 'notification', '{"type": "manager"}', NULL, 'P2', 'async', '{"max_attempts": 5}', 'retry'),
('absence.requested', 'task.create', 'task', '{"type": "manager"}', NULL, 'P1', 'async', '{"max_attempts": 3}', 'retry'),
('absence.approved', 'notification.in_app', 'notification', '{"type": "actor"}', NULL, 'P0', 'async', '{"max_attempts": 3}', 'retry'),
('absence.approved', 'notification.email', 'notification', '{"type": "actor"}', NULL, 'P1', 'async', '{"max_attempts": 5}', 'retry'),
('absence.approved', 'ui.badge_update', 'ui', '{"type": "actor"}', NULL, 'P0', 'sync', '{"max_attempts": 1}', 'skip'),
('absence.rejected', 'notification.in_app', 'notification', '{"type": "actor"}', NULL, 'P0', 'async', '{"max_attempts": 3}', 'retry'),
('absence.rejected', 'notification.email', 'notification', '{"type": "actor"}', NULL, 'P1', 'async', '{"max_attempts": 5}', 'retry'),
('absence.cancelled', 'notification.in_app', 'notification', '{"type": "manager"}', NULL, 'P2', 'async', '{"max_attempts": 3}', 'skip'),
('absence.substitute_assigned', 'notification.in_app', 'notification', '{"type": "assigned_user"}', NULL, 'P1', 'async', '{"max_attempts": 3}', 'retry'),

-- ==================== EMPLOYEE MODULE ====================
('employee.created', 'notification.in_app', 'notification', '{"type": "role", "role_name": "hr_manager"}', NULL, 'P2', 'async', '{"max_attempts": 3}', 'skip'),
('employee.created', 'task.create', 'task', '{"type": "role", "role_name": "hr_manager"}', NULL, 'P1', 'async', '{"max_attempts": 3}', 'retry'),
('employee.role_changed', 'notification.in_app', 'notification', '{"type": "actor"}', NULL, 'P1', 'async', '{"max_attempts": 3}', 'retry'),
('employee.role_changed', 'notification.email', 'notification', '{"type": "actor"}', NULL, 'P2', 'async', '{"max_attempts": 5}', 'retry'),
('employee.department_changed', 'notification.in_app', 'notification', '{"type": "manager"}', NULL, 'P2', 'async', '{"max_attempts": 3}', 'skip'),
('employee.deactivated', 'notification.in_app', 'notification', '{"type": "role", "role_name": "admin"}', NULL, 'P1', 'async', '{"max_attempts": 3}', 'retry'),
('employee.deactivated', 'notification.email', 'notification', '{"type": "role", "role_name": "admin"}', NULL, 'P1', 'async', '{"max_attempts": 5}', 'retry')

ON CONFLICT DO NOTHING;