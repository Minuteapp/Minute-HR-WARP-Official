-- =====================================================
-- Teamlead-Rolle und erweiterte Default-Berechtigungen
-- für role_permission_matrix
-- =====================================================

-- 1. Teamleiter Berechtigungen hinzufügen
-- Module die Teamleiter NICHT sehen dürfen
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions)
VALUES 
  ('teamlead', 'employees', true, ARRAY['view', 'export']::text[]),
  ('teamlead', 'Mitarbeiter', true, ARRAY['view', 'export']::text[]),
  ('teamlead', 'absence', true, ARRAY['view', 'create', 'edit', 'approve', 'export']::text[]),
  ('teamlead', 'Abwesenheit', true, ARRAY['view', 'create', 'edit', 'approve', 'export']::text[]),
  ('teamlead', 'time_tracking', true, ARRAY['view', 'edit', 'approve', 'export']::text[]),
  ('teamlead', 'Zeiterfassung', true, ARRAY['view', 'edit', 'approve', 'export']::text[]),
  ('teamlead', 'tasks', true, ARRAY['view', 'create', 'edit', 'delete', 'export']::text[]),
  ('teamlead', 'Aufgaben', true, ARRAY['view', 'create', 'edit', 'delete', 'export']::text[]),
  ('teamlead', 'projects', true, ARRAY['view', 'create', 'edit', 'export']::text[]),
  ('teamlead', 'Projekte', true, ARRAY['view', 'create', 'edit', 'export']::text[]),
  ('teamlead', 'performance', true, ARRAY['view', 'create', 'edit']::text[]),
  ('teamlead', 'Performance', true, ARRAY['view', 'create', 'edit']::text[]),
  ('teamlead', 'reports', true, ARRAY['view', 'export']::text[]),
  ('teamlead', 'Berichte', true, ARRAY['view', 'export']::text[]),
  ('teamlead', 'dashboard', true, ARRAY['view']::text[]),
  ('teamlead', 'Dashboard', true, ARRAY['view']::text[]),
  ('teamlead', 'calendar', true, ARRAY['view', 'create', 'edit']::text[]),
  ('teamlead', 'Kalender', true, ARRAY['view', 'create', 'edit']::text[]),
  ('teamlead', 'documents', true, ARRAY['view', 'create', 'edit', 'delete']::text[]),
  ('teamlead', 'Dokumente', true, ARRAY['view', 'create', 'edit', 'delete']::text[]),
  ('teamlead', 'knowledge', true, ARRAY['view', 'create', 'edit']::text[]),
  ('teamlead', 'Wissensdatenbank', true, ARRAY['view', 'create', 'edit']::text[]),
  ('teamlead', 'chat', true, ARRAY['view', 'create', 'edit']::text[]),
  ('teamlead', 'Chat', true, ARRAY['view', 'create', 'edit']::text[]),
  ('teamlead', 'roadmap', true, ARRAY['view', 'create', 'edit']::text[]),
  ('teamlead', 'Roadmap', true, ARRAY['view', 'create', 'edit']::text[]),
  ('teamlead', 'helpdesk', true, ARRAY['view', 'create', 'edit']::text[]),
  ('teamlead', 'HR Helpdesk', true, ARRAY['view', 'create', 'edit']::text[]),
  -- Module die Teamleiter NICHT sehen dürfen
  ('teamlead', 'payroll', false, ARRAY[]::text[]),
  ('teamlead', 'Lohn & Gehalt', false, ARRAY[]::text[]),
  ('teamlead', 'recruiting', false, ARRAY[]::text[]),
  ('teamlead', 'Recruiting', false, ARRAY[]::text[]),
  ('teamlead', 'onboarding', false, ARRAY[]::text[]),
  ('teamlead', 'Onboarding', false, ARRAY[]::text[]),
  ('teamlead', 'workflow', false, ARRAY[]::text[]),
  ('teamlead', 'Workflows', false, ARRAY[]::text[]),
  ('teamlead', 'workforce_planning', false, ARRAY[]::text[]),
  ('teamlead', 'Workforce Planning', false, ARRAY[]::text[]),
  ('teamlead', 'hr_organization_design', false, ARRAY[]::text[]),
  ('teamlead', 'Organisationsdesign', false, ARRAY[]::text[]),
  ('teamlead', 'compliance', false, ARRAY[]::text[]),
  ('teamlead', 'Compliance Hub', false, ARRAY[]::text[]),
  ('teamlead', 'budget', false, ARRAY[]::text[]),
  ('teamlead', 'Budget', false, ARRAY[]::text[])
ON CONFLICT (role, module_name) DO UPDATE SET
  is_visible = EXCLUDED.is_visible,
  allowed_actions = EXCLUDED.allowed_actions;

-- 2. Mitarbeiter Default-Berechtigungen (Module die sie NICHT sehen dürfen)
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions)
VALUES 
  -- Nicht sichtbar für Mitarbeiter
  ('employee', 'employees', false, ARRAY[]::text[]),
  ('employee', 'Mitarbeiter', false, ARRAY[]::text[]),
  ('employee', 'payroll', false, ARRAY[]::text[]),
  ('employee', 'Lohn & Gehalt', false, ARRAY[]::text[]),
  ('employee', 'recruiting', false, ARRAY[]::text[]),
  ('employee', 'Recruiting', false, ARRAY[]::text[]),
  ('employee', 'onboarding', false, ARRAY[]::text[]),
  ('employee', 'Onboarding', false, ARRAY[]::text[]),
  ('employee', 'workflow', false, ARRAY[]::text[]),
  ('employee', 'Workflows', false, ARRAY[]::text[]),
  ('employee', 'workforce_planning', false, ARRAY[]::text[]),
  ('employee', 'Workforce Planning', false, ARRAY[]::text[]),
  ('employee', 'hr_organization_design', false, ARRAY[]::text[]),
  ('employee', 'Organisationsdesign', false, ARRAY[]::text[]),
  ('employee', 'compliance', false, ARRAY[]::text[]),
  ('employee', 'Compliance Hub', false, ARRAY[]::text[]),
  ('employee', 'budget', false, ARRAY[]::text[]),
  ('employee', 'Budget', false, ARRAY[]::text[]),
  ('employee', 'reports', false, ARRAY[]::text[]),
  ('employee', 'Berichte', false, ARRAY[]::text[]),
  -- Sichtbar für Mitarbeiter (eigene Daten)
  ('employee', 'absence', true, ARRAY['view', 'create', 'edit']::text[]),
  ('employee', 'Abwesenheit', true, ARRAY['view', 'create', 'edit']::text[]),
  ('employee', 'time_tracking', true, ARRAY['view', 'create', 'edit']::text[]),
  ('employee', 'Zeiterfassung', true, ARRAY['view', 'create', 'edit']::text[]),
  ('employee', 'tasks', true, ARRAY['view', 'create', 'edit']::text[]),
  ('employee', 'Aufgaben', true, ARRAY['view', 'create', 'edit']::text[]),
  ('employee', 'projects', true, ARRAY['view']::text[]),
  ('employee', 'Projekte', true, ARRAY['view']::text[]),
  ('employee', 'documents', true, ARRAY['view', 'create']::text[]),
  ('employee', 'Dokumente', true, ARRAY['view', 'create']::text[]),
  ('employee', 'dashboard', true, ARRAY['view']::text[]),
  ('employee', 'Dashboard', true, ARRAY['view']::text[]),
  ('employee', 'calendar', true, ARRAY['view']::text[]),
  ('employee', 'Kalender', true, ARRAY['view']::text[]),
  ('employee', 'profil', true, ARRAY['view', 'edit']::text[]),
  ('employee', 'Profile', true, ARRAY['view', 'edit']::text[]),
  ('employee', 'knowledge', true, ARRAY['view']::text[]),
  ('employee', 'Wissensdatenbank', true, ARRAY['view']::text[]),
  ('employee', 'chat', true, ARRAY['view', 'create', 'edit']::text[]),
  ('employee', 'Chat', true, ARRAY['view', 'create', 'edit']::text[]),
  ('employee', 'helpdesk', true, ARRAY['view', 'create']::text[]),
  ('employee', 'HR Helpdesk', true, ARRAY['view', 'create']::text[]),
  ('employee', 'performance', true, ARRAY['view']::text[]),
  ('employee', 'Performance', true, ARRAY['view']::text[])
ON CONFLICT (role, module_name) DO UPDATE SET
  is_visible = EXCLUDED.is_visible,
  allowed_actions = EXCLUDED.allowed_actions;

-- 3. HR-Manager Berechtigungen
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions)
VALUES 
  ('hr_manager', 'employees', true, ARRAY['view', 'create', 'edit', 'delete', 'export']::text[]),
  ('hr_manager', 'Mitarbeiter', true, ARRAY['view', 'create', 'edit', 'delete', 'export']::text[]),
  ('hr_manager', 'payroll', true, ARRAY['view']::text[]),
  ('hr_manager', 'Lohn & Gehalt', true, ARRAY['view']::text[]),
  ('hr_manager', 'recruiting', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']::text[]),
  ('hr_manager', 'Recruiting', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']::text[]),
  ('hr_manager', 'onboarding', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']::text[]),
  ('hr_manager', 'Onboarding', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']::text[]),
  ('hr_manager', 'workforce_planning', true, ARRAY['view', 'create', 'edit', 'export']::text[]),
  ('hr_manager', 'Workforce Planning', true, ARRAY['view', 'create', 'edit', 'export']::text[]),
  ('hr_manager', 'hr_organization_design', true, ARRAY['view', 'create', 'edit', 'export']::text[]),
  ('hr_manager', 'Organisationsdesign', true, ARRAY['view', 'create', 'edit', 'export']::text[]),
  ('hr_manager', 'compliance', true, ARRAY['view', 'create', 'edit', 'export']::text[]),
  ('hr_manager', 'Compliance Hub', true, ARRAY['view', 'create', 'edit', 'export']::text[]),
  ('hr_manager', 'reports', true, ARRAY['view', 'create', 'export']::text[]),
  ('hr_manager', 'Berichte', true, ARRAY['view', 'create', 'export']::text[]),
  ('hr_manager', 'performance', true, ARRAY['view', 'create', 'edit', 'approve', 'export']::text[]),
  ('hr_manager', 'Performance', true, ARRAY['view', 'create', 'edit', 'approve', 'export']::text[]),
  -- Module die auch HR-Manager NICHT sehen
  ('hr_manager', 'workflow', false, ARRAY[]::text[]),
  ('hr_manager', 'Workflows', false, ARRAY[]::text[]),
  ('hr_manager', 'budget', true, ARRAY['view']::text[]),
  ('hr_manager', 'Budget', true, ARRAY['view']::text[])
ON CONFLICT (role, module_name) DO UPDATE SET
  is_visible = EXCLUDED.is_visible,
  allowed_actions = EXCLUDED.allowed_actions;

-- 4. Manager (Vorgesetzte) Berechtigungen  
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions)
VALUES 
  ('manager', 'employees', true, ARRAY['view']::text[]),
  ('manager', 'Mitarbeiter', true, ARRAY['view']::text[]),
  ('manager', 'absence', true, ARRAY['view', 'approve', 'export']::text[]),
  ('manager', 'Abwesenheit', true, ARRAY['view', 'approve', 'export']::text[]),
  ('manager', 'time_tracking', true, ARRAY['view', 'approve', 'export']::text[]),
  ('manager', 'Zeiterfassung', true, ARRAY['view', 'approve', 'export']::text[]),
  ('manager', 'tasks', true, ARRAY['view', 'create', 'edit', 'delete']::text[]),
  ('manager', 'Aufgaben', true, ARRAY['view', 'create', 'edit', 'delete']::text[]),
  ('manager', 'projects', true, ARRAY['view', 'create', 'edit']::text[]),
  ('manager', 'Projekte', true, ARRAY['view', 'create', 'edit']::text[]),
  ('manager', 'performance', true, ARRAY['view', 'create', 'edit']::text[]),
  ('manager', 'Performance', true, ARRAY['view', 'create', 'edit']::text[]),
  ('manager', 'reports', true, ARRAY['view', 'export']::text[]),
  ('manager', 'Berichte', true, ARRAY['view', 'export']::text[]),
  -- Module die Manager NICHT sehen dürfen
  ('manager', 'payroll', false, ARRAY[]::text[]),
  ('manager', 'Lohn & Gehalt', false, ARRAY[]::text[]),
  ('manager', 'recruiting', false, ARRAY[]::text[]),
  ('manager', 'Recruiting', false, ARRAY[]::text[]),
  ('manager', 'onboarding', false, ARRAY[]::text[]),
  ('manager', 'Onboarding', false, ARRAY[]::text[]),
  ('manager', 'workflow', false, ARRAY[]::text[]),
  ('manager', 'Workflows', false, ARRAY[]::text[]),
  ('manager', 'workforce_planning', false, ARRAY[]::text[]),
  ('manager', 'Workforce Planning', false, ARRAY[]::text[]),
  ('manager', 'hr_organization_design', false, ARRAY[]::text[]),
  ('manager', 'Organisationsdesign', false, ARRAY[]::text[]),
  ('manager', 'compliance', false, ARRAY[]::text[]),
  ('manager', 'Compliance Hub', false, ARRAY[]::text[]),
  ('manager', 'budget', false, ARRAY[]::text[]),
  ('manager', 'Budget', false, ARRAY[]::text[])
ON CONFLICT (role, module_name) DO UPDATE SET
  is_visible = EXCLUDED.is_visible,
  allowed_actions = EXCLUDED.allowed_actions;