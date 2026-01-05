-- =====================================================
-- COMPLETE ROLE PERMISSIONS: All Modules + 80/20 Defaults
-- =====================================================

-- 1. Add all main modules to permission_modules (for default company)
-- First, get the count to verify what exists
DO $$
DECLARE
  default_company_id uuid;
BEGIN
  -- Get first company as default
  SELECT id INTO default_company_id FROM companies LIMIT 1;
  
  IF default_company_id IS NOT NULL THEN
    -- Insert main modules
    INSERT INTO permission_modules (module_key, name, description, module_type, is_active, company_id, icon, color)
    VALUES
      ('dashboard', 'Dashboard', 'Startseite und Übersicht', 'module', true, default_company_id, 'LayoutDashboard', 'blue'),
      ('absence', 'Abwesenheit', 'Urlaub, Krankheit, Sonderurlaub', 'module', true, default_company_id, 'Calendar', 'green'),
      ('calendar', 'Kalender', 'Termine und Planung', 'module', true, default_company_id, 'CalendarDays', 'purple'),
      ('time_tracking', 'Zeiterfassung', 'Arbeitszeiten erfassen', 'module', true, default_company_id, 'Clock', 'orange'),
      ('payroll', 'Lohn & Gehalt', 'Gehaltsabrechnung', 'module', true, default_company_id, 'Wallet', 'emerald'),
      ('documents', 'Dokumente', 'Dokumentenverwaltung', 'module', true, default_company_id, 'FileText', 'gray'),
      ('projects', 'Projekte', 'Projektverwaltung', 'module', true, default_company_id, 'FolderKanban', 'indigo'),
      ('helpdesk', 'Helpdesk', 'IT-Support und Tickets', 'module', true, default_company_id, 'Headphones', 'red'),
      ('knowledge_hub', 'Knowledge Hub', 'Wissensdatenbank', 'module', true, default_company_id, 'BookOpen', 'cyan'),
      ('innovation', 'Innovation', 'Ideen und Vorschläge', 'module', true, default_company_id, 'Lightbulb', 'yellow'),
      ('recruiting', 'Recruiting', 'Bewerbermanagement', 'module', true, default_company_id, 'Users', 'pink'),
      ('reports', 'Berichte', 'Auswertungen', 'module', true, default_company_id, 'BarChart', 'slate'),
      ('settings', 'Einstellungen', 'Systemkonfiguration', 'module', true, default_company_id, 'Settings', 'zinc'),
      ('budget', 'Budget', 'Budgetverwaltung', 'module', true, default_company_id, 'PiggyBank', 'lime'),
      ('business_travel', 'Dienstreisen', 'Reisemanagement', 'module', true, default_company_id, 'Plane', 'sky'),
      ('compliance', 'Compliance', 'Richtlinien', 'module', true, default_company_id, 'ShieldCheck', 'teal'),
      ('shift_planning', 'Schichtplanung', 'Dienstplanung', 'module', true, default_company_id, 'CalendarClock', 'violet'),
      ('performance', 'Performance', 'Leistungsbewertung', 'module', true, default_company_id, 'TrendingUp', 'rose'),
      ('goals', 'Ziele', 'Zielvereinbarungen', 'module', true, default_company_id, 'Target', 'amber'),
      ('rewards', 'Rewards', 'Mitarbeiterbelohnungen', 'module', true, default_company_id, 'Gift', 'fuchsia'),
      ('onboarding', 'Onboarding', 'Einarbeitung', 'module', true, default_company_id, 'UserPlus', 'emerald'),
      ('organization_design', 'Organisationsdesign', 'Strukturen', 'module', true, default_company_id, 'Network', 'blue'),
      ('workforce_planning', 'Personalplanung', 'Kapazitätsplanung', 'module', true, default_company_id, 'Users2', 'purple'),
      ('company_cards', 'Firmenkarten', 'Zahlungsmittel', 'module', true, default_company_id, 'CreditCard', 'orange'),
      ('expenses', 'Spesen', 'Auslagenerstattung', 'module', true, default_company_id, 'Receipt', 'green'),
      ('global_mobility', 'Global Mobility', 'Auslandsentsendung', 'module', true, default_company_id, 'Globe', 'cyan'),
      ('surveys', 'Umfragen', 'Mitarbeiterbefragungen', 'module', true, default_company_id, 'ClipboardList', 'indigo'),
      ('chat', 'Chat', 'Kommunikation', 'module', true, default_company_id, 'MessageSquare', 'blue'),
      ('notifications', 'Benachrichtigungen', 'Alerts', 'module', true, default_company_id, 'Bell', 'yellow'),
      ('workflow', 'Workflow', 'Prozessautomation', 'module', true, default_company_id, 'Workflow', 'purple'),
      ('fleet', 'Fuhrpark', 'Fahrzeugverwaltung', 'module', true, default_company_id, 'Car', 'slate'),
      ('assets', 'Assets', 'Arbeitsmittel', 'module', true, default_company_id, 'Package', 'gray'),
      ('training', 'Weiterbildung', 'Schulungen', 'module', true, default_company_id, 'GraduationCap', 'teal'),
      ('ai_hub', 'AI Hub', 'KI-Funktionen', 'module', true, default_company_id, 'Brain', 'violet')
    ON CONFLICT (module_key) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      module_type = EXCLUDED.module_type,
      is_active = EXCLUDED.is_active,
      icon = EXCLUDED.icon,
      color = EXCLUDED.color;
  END IF;
END $$;

-- 2. Create 80/20 Default Permissions for each role
-- Using allowed_actions array format: view, create, edit, delete, approve, export

-- EMPLOYEE PERMISSIONS
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions, company_id)
SELECT 
  'employee' as role,
  module_name,
  is_visible,
  allowed_actions,
  (SELECT id FROM companies LIMIT 1) as company_id
FROM (VALUES
  ('dashboard', true, ARRAY['view']),
  ('calendar', true, ARRAY['view', 'create', 'edit', 'delete']),
  ('documents', true, ARRAY['view', 'create', 'edit', 'delete', 'export']),
  ('chat', true, ARRAY['view', 'create', 'edit', 'delete']),
  ('notifications', true, ARRAY['view', 'edit', 'delete']),
  ('absence', true, ARRAY['view', 'create', 'edit', 'delete']),
  ('time_tracking', true, ARRAY['view', 'create', 'edit', 'delete']),
  ('payroll', true, ARRAY['view', 'export']),
  ('business_travel', true, ARRAY['view', 'create', 'edit', 'delete']),
  ('expenses', true, ARRAY['view', 'create', 'edit', 'delete']),
  ('goals', true, ARRAY['view']),
  ('performance', true, ARRAY['view']),
  ('training', true, ARRAY['view', 'create']),
  ('surveys', true, ARRAY['view', 'create']),
  ('projects', true, ARRAY['view']),
  ('innovation', true, ARRAY['view', 'create', 'edit', 'delete']),
  ('helpdesk', true, ARRAY['view', 'create', 'edit']),
  ('knowledge_hub', true, ARRAY['view']),
  ('reports', false, ARRAY[]::text[]),
  ('settings', false, ARRAY[]::text[]),
  ('budget', false, ARRAY[]::text[]),
  ('compliance', true, ARRAY['view']),
  ('recruiting', false, ARRAY[]::text[]),
  ('shift_planning', true, ARRAY['view']),
  ('rewards', true, ARRAY['view']),
  ('onboarding', true, ARRAY['view']),
  ('organization_design', true, ARRAY['view']),
  ('workforce_planning', false, ARRAY[]::text[]),
  ('company_cards', true, ARRAY['view']),
  ('global_mobility', true, ARRAY['view', 'create']),
  ('workflow', false, ARRAY[]::text[]),
  ('fleet', true, ARRAY['view']),
  ('assets', true, ARRAY['view']),
  ('ai_hub', false, ARRAY[]::text[])
) AS t(module_name, is_visible, allowed_actions)
ON CONFLICT (role, module_name) DO UPDATE SET
  is_visible = EXCLUDED.is_visible,
  allowed_actions = EXCLUDED.allowed_actions;

-- MANAGER PERMISSIONS
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions, company_id)
SELECT 
  'manager' as role,
  module_name,
  is_visible,
  allowed_actions,
  (SELECT id FROM companies LIMIT 1) as company_id
FROM (VALUES
  ('dashboard', true, ARRAY['view', 'export']),
  ('calendar', true, ARRAY['view', 'create', 'edit', 'delete', 'export']),
  ('documents', true, ARRAY['view', 'create', 'edit', 'delete', 'export']),
  ('chat', true, ARRAY['view', 'create', 'edit', 'delete']),
  ('notifications', true, ARRAY['view', 'create', 'edit', 'delete']),
  ('absence', true, ARRAY['view', 'create', 'edit', 'approve', 'export']),
  ('time_tracking', true, ARRAY['view', 'create', 'edit', 'approve', 'export']),
  ('payroll', true, ARRAY['view', 'export']),
  ('business_travel', true, ARRAY['view', 'create', 'edit', 'approve', 'export']),
  ('expenses', true, ARRAY['view', 'create', 'edit', 'approve', 'export']),
  ('goals', true, ARRAY['view', 'create', 'edit', 'approve']),
  ('performance', true, ARRAY['view', 'create', 'edit', 'approve', 'export']),
  ('training', true, ARRAY['view', 'create', 'edit', 'approve']),
  ('surveys', true, ARRAY['view', 'create', 'edit', 'export']),
  ('shift_planning', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('rewards', true, ARRAY['view', 'create', 'approve']),
  ('onboarding', true, ARRAY['view', 'create', 'edit']),
  ('projects', true, ARRAY['view', 'create', 'edit', 'approve', 'export']),
  ('innovation', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('fleet', true, ARRAY['view', 'create', 'edit', 'approve', 'export']),
  ('assets', true, ARRAY['view', 'create', 'edit', 'approve', 'export']),
  ('helpdesk', true, ARRAY['view', 'create', 'edit']),
  ('knowledge_hub', true, ARRAY['view', 'create', 'edit']),
  ('reports', true, ARRAY['view', 'export']),
  ('settings', false, ARRAY[]::text[]),
  ('budget', true, ARRAY['view', 'export']),
  ('compliance', true, ARRAY['view']),
  ('recruiting', true, ARRAY['view', 'create']),
  ('organization_design', true, ARRAY['view']),
  ('workforce_planning', true, ARRAY['view', 'export']),
  ('company_cards', true, ARRAY['view', 'approve']),
  ('global_mobility', true, ARRAY['view', 'create', 'edit', 'approve']),
  ('workflow', true, ARRAY['view']),
  ('ai_hub', false, ARRAY[]::text[])
) AS t(module_name, is_visible, allowed_actions)
ON CONFLICT (role, module_name) DO UPDATE SET
  is_visible = EXCLUDED.is_visible,
  allowed_actions = EXCLUDED.allowed_actions;

-- HR_MANAGER PERMISSIONS
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions, company_id)
SELECT 
  'hr_manager' as role,
  module_name,
  is_visible,
  allowed_actions,
  (SELECT id FROM companies LIMIT 1) as company_id
FROM (VALUES
  ('dashboard', true, ARRAY['view', 'create', 'edit', 'export']),
  ('calendar', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('documents', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('chat', true, ARRAY['view', 'create', 'edit', 'delete']),
  ('notifications', true, ARRAY['view', 'create', 'edit', 'delete']),
  ('absence', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('time_tracking', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('payroll', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('business_travel', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('expenses', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('goals', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('performance', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('training', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('surveys', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('shift_planning', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('rewards', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('onboarding', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('recruiting', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('global_mobility', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('workforce_planning', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('projects', true, ARRAY['view', 'create', 'edit', 'export']),
  ('innovation', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('fleet', true, ARRAY['view', 'create', 'edit', 'export']),
  ('assets', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('helpdesk', true, ARRAY['view', 'create', 'edit', 'delete', 'export']),
  ('knowledge_hub', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('reports', true, ARRAY['view', 'create', 'edit', 'export']),
  ('settings', true, ARRAY['view', 'create', 'edit']),
  ('budget', true, ARRAY['view', 'export']),
  ('compliance', true, ARRAY['view', 'create', 'edit', 'approve', 'export']),
  ('organization_design', true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']),
  ('company_cards', true, ARRAY['view', 'create', 'edit', 'approve', 'export']),
  ('workflow', true, ARRAY['view', 'create', 'edit', 'approve']),
  ('ai_hub', true, ARRAY['view'])
) AS t(module_name, is_visible, allowed_actions)
ON CONFLICT (role, module_name) DO UPDATE SET
  is_visible = EXCLUDED.is_visible,
  allowed_actions = EXCLUDED.allowed_actions;

-- ADMIN PERMISSIONS (Full access to all)
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions, company_id)
SELECT 
  'admin' as role,
  module_name,
  true as is_visible,
  ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export'] as allowed_actions,
  (SELECT id FROM companies LIMIT 1) as company_id
FROM (VALUES
  ('dashboard'), ('calendar'), ('documents'), ('chat'), ('notifications'),
  ('absence'), ('time_tracking'), ('payroll'), ('business_travel'), ('expenses'),
  ('goals'), ('performance'), ('training'), ('surveys'), ('shift_planning'),
  ('rewards'), ('onboarding'), ('recruiting'), ('global_mobility'), ('workforce_planning'),
  ('projects'), ('innovation'), ('fleet'), ('assets'), ('helpdesk'),
  ('knowledge_hub'), ('reports'), ('settings'), ('budget'), ('compliance'),
  ('organization_design'), ('company_cards'), ('workflow'), ('ai_hub')
) AS t(module_name)
ON CONFLICT (role, module_name) DO UPDATE SET
  is_visible = EXCLUDED.is_visible,
  allowed_actions = EXCLUDED.allowed_actions;

-- SUPERADMIN PERMISSIONS (Full access to all)
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions, company_id)
SELECT 
  'superadmin' as role,
  module_name,
  true as is_visible,
  ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export'] as allowed_actions,
  (SELECT id FROM companies LIMIT 1) as company_id
FROM (VALUES
  ('dashboard'), ('calendar'), ('documents'), ('chat'), ('notifications'),
  ('absence'), ('time_tracking'), ('payroll'), ('business_travel'), ('expenses'),
  ('goals'), ('performance'), ('training'), ('surveys'), ('shift_planning'),
  ('rewards'), ('onboarding'), ('recruiting'), ('global_mobility'), ('workforce_planning'),
  ('projects'), ('innovation'), ('fleet'), ('assets'), ('helpdesk'),
  ('knowledge_hub'), ('reports'), ('settings'), ('budget'), ('compliance'),
  ('organization_design'), ('company_cards'), ('workflow'), ('ai_hub')
) AS t(module_name)
ON CONFLICT (role, module_name) DO UPDATE SET
  is_visible = EXCLUDED.is_visible,
  allowed_actions = EXCLUDED.allowed_actions;