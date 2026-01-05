-- Füge team_lead und hr_admin Berechtigungen hinzu

-- HR-Admin Berechtigungen
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions, company_id)
SELECT DISTINCT 'hr_admin', module_name, true, ARRAY['view', 'create', 'edit', 'delete', 'approve'], company_id
FROM role_permission_matrix
WHERE role = 'admin'
AND module_name IN ('employees', 'absence', 'recruiting', 'onboarding', 'payroll', 'performance', 'training', 'documents', 'compliance', 'time_tracking')
ON CONFLICT DO NOTHING;

-- Team-Lead Berechtigungen  
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions, company_id)
SELECT DISTINCT 'team_lead', module_name, true, ARRAY['view', 'create', 'edit', 'approve'], company_id
FROM role_permission_matrix
WHERE role = 'admin'
AND module_name IN ('employees', 'absence', 'tasks', 'shift_planning', 'performance', 'calendar', 'time_tracking')
ON CONFLICT DO NOTHING;

-- Stelle sicher dass employee die Basis-Berechtigungen hat
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions, company_id)
SELECT DISTINCT 'employee', module_name, true, ARRAY['view', 'create'], company_id
FROM role_permission_matrix
WHERE role = 'admin'
AND module_name IN ('absence', 'tasks', 'documents', 'calendar', 'training', 'time_tracking')
ON CONFLICT DO NOTHING;