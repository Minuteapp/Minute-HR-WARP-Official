-- =====================================================
-- 4-Rollen-System: Menüpunkt-Berechtigungen
-- =====================================================

-- 1) Tabelle für Modul-Menüpunkte
CREATE TABLE IF NOT EXISTS public.module_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT NOT NULL,
  menu_key TEXT NOT NULL,
  menu_name TEXT NOT NULL,
  menu_name_en TEXT,
  menu_order INTEGER DEFAULT 0,
  requires_team_context BOOLEAN DEFAULT false,
  parent_menu_key TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module_key, menu_key)
);

-- 2) Tabelle für Rollen-Menüpunkt-Berechtigungen
CREATE TABLE IF NOT EXISTS public.role_menu_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  module_key TEXT NOT NULL,
  menu_key TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  scope TEXT DEFAULT 'own' CHECK (scope IN ('own', 'team', 'department', 'all')),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, module_key, menu_key, company_id)
);

-- RLS aktivieren
ALTER TABLE public.module_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_menu_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies für module_menu_items (lesbar für alle authentifizierten Nutzer)
CREATE POLICY "Module menu items are readable by authenticated users"
  ON public.module_menu_items
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies für role_menu_permissions
CREATE POLICY "Role menu permissions are readable by company members"
  ON public.role_menu_permissions
  FOR SELECT
  TO authenticated
  USING (
    company_id IS NULL 
    OR company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Role menu permissions are manageable by admins"
  ON public.role_menu_permissions
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 3) Menüpunkte für alle Module einfügen
-- =====================================================

-- ABWESENHEIT
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('absence', 'my_absences', 'Meine Abwesenheiten', 1, false, 'Calendar'),
('absence', 'overview', 'Übersicht', 2, false, 'LayoutGrid'),
('absence', 'team_overview', 'Team-Übersicht', 3, true, 'Users'),
('absence', 'approvals', 'Genehmigungen', 4, true, 'CheckCircle'),
('absence', 'calendar', 'Kalender', 5, false, 'CalendarDays'),
('absence', 'reports', 'Berichte', 6, false, 'FileText'),
('absence', 'settings', 'Einstellungen', 7, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- ZEITERFASSUNG
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('time', 'my_times', 'Meine Zeiten', 1, false, 'Clock'),
('time', 'overview', 'Übersicht', 2, false, 'LayoutGrid'),
('time', 'team_overview', 'Team-Übersicht', 3, true, 'Users'),
('time', 'corrections', 'Korrekturen', 4, true, 'Edit'),
('time', 'reports', 'Berichte', 5, false, 'FileText'),
('time', 'settings', 'Einstellungen', 6, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- LOHN/GEHALT (PAYROLL)
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('payroll', 'my_payslips', 'Meine Gehaltsabrechnungen', 1, false, 'Receipt'),
('payroll', 'overview', 'Übersicht', 2, false, 'LayoutGrid'),
('payroll', 'payroll_run', 'Abrechnungslauf', 3, false, 'Play'),
('payroll', 'reports', 'Berichte', 4, false, 'FileText'),
('payroll', 'settings', 'Einstellungen', 5, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- PROJEKTE
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('projects', 'my_projects', 'Meine Projekte', 1, false, 'FolderOpen'),
('projects', 'overview', 'Übersicht', 2, false, 'LayoutGrid'),
('projects', 'time_tracking', 'Zeiterfassung', 3, false, 'Clock'),
('projects', 'reports', 'Berichte', 4, false, 'FileText'),
('projects', 'settings', 'Einstellungen', 5, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- RECRUITING
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('recruiting', 'dashboard', 'Dashboard', 1, false, 'LayoutDashboard'),
('recruiting', 'jobs', 'Stellenanzeigen', 2, false, 'Briefcase'),
('recruiting', 'candidates', 'Bewerber', 3, false, 'Users'),
('recruiting', 'pipeline', 'Pipeline', 4, false, 'GitBranch'),
('recruiting', 'reports', 'Berichte', 5, false, 'FileText'),
('recruiting', 'settings', 'Einstellungen', 6, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- ONBOARDING
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('onboarding', 'my_onboarding', 'Mein Onboarding', 1, false, 'UserPlus'),
('onboarding', 'overview', 'Übersicht', 2, false, 'LayoutGrid'),
('onboarding', 'templates', 'Vorlagen', 3, false, 'FileTemplate'),
('onboarding', 'reports', 'Berichte', 4, false, 'FileText'),
('onboarding', 'settings', 'Einstellungen', 5, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- HELPDESK
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('helpdesk', 'my_tickets', 'Meine Tickets', 1, false, 'Ticket'),
('helpdesk', 'all_tickets', 'Alle Tickets', 2, false, 'LayoutGrid'),
('helpdesk', 'knowledge_base', 'Wissensdatenbank', 3, false, 'Book'),
('helpdesk', 'reports', 'Berichte', 4, false, 'FileText'),
('helpdesk', 'settings', 'Einstellungen', 5, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- DOKUMENTE
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('documents', 'my_documents', 'Meine Dokumente', 1, false, 'FileText'),
('documents', 'shared', 'Geteilte Dokumente', 2, false, 'Share'),
('documents', 'templates', 'Vorlagen', 3, false, 'FileTemplate'),
('documents', 'archive', 'Archiv', 4, false, 'Archive'),
('documents', 'settings', 'Einstellungen', 5, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- GOALS / ZIELE
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('goals', 'my_goals', 'Meine Ziele', 1, false, 'Target'),
('goals', 'team_goals', 'Team-Ziele', 2, true, 'Users'),
('goals', 'company_goals', 'Unternehmensziele', 3, false, 'Building'),
('goals', 'reports', 'Berichte', 4, false, 'FileText'),
('goals', 'settings', 'Einstellungen', 5, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- PERFORMANCE
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('performance', 'my_reviews', 'Meine Bewertungen', 1, false, 'Star'),
('performance', 'team_reviews', 'Team-Bewertungen', 2, true, 'Users'),
('performance', 'cycles', 'Bewertungszyklen', 3, false, 'RefreshCw'),
('performance', 'reports', 'Berichte', 4, false, 'FileText'),
('performance', 'settings', 'Einstellungen', 5, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- SCHICHTPLANUNG
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('shifts', 'my_shifts', 'Meine Schichten', 1, false, 'Calendar'),
('shifts', 'team_shifts', 'Team-Schichten', 2, true, 'Users'),
('shifts', 'planning', 'Planung', 3, false, 'CalendarDays'),
('shifts', 'swap_requests', 'Tausch-Anfragen', 4, false, 'ArrowLeftRight'),
('shifts', 'reports', 'Berichte', 5, false, 'FileText'),
('shifts', 'settings', 'Einstellungen', 6, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- REISEKOSTEN
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('travel', 'my_trips', 'Meine Reisen', 1, false, 'Plane'),
('travel', 'requests', 'Reiseanträge', 2, false, 'FileText'),
('travel', 'approvals', 'Genehmigungen', 3, true, 'CheckCircle'),
('travel', 'reports', 'Berichte', 4, false, 'FileText'),
('travel', 'settings', 'Einstellungen', 5, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- SPESEN
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('expenses', 'my_expenses', 'Meine Spesen', 1, false, 'Receipt'),
('expenses', 'submit', 'Einreichen', 2, false, 'Upload'),
('expenses', 'approvals', 'Genehmigungen', 3, true, 'CheckCircle'),
('expenses', 'reports', 'Berichte', 4, false, 'FileText'),
('expenses', 'settings', 'Einstellungen', 5, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- INNOVATION
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('innovation', 'my_ideas', 'Meine Ideen', 1, false, 'Lightbulb'),
('innovation', 'all_ideas', 'Alle Ideen', 2, false, 'LayoutGrid'),
('innovation', 'voting', 'Abstimmung', 3, false, 'Vote'),
('innovation', 'reports', 'Berichte', 4, false, 'FileText'),
('innovation', 'settings', 'Einstellungen', 5, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- UMFRAGEN
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('surveys', 'my_surveys', 'Meine Umfragen', 1, false, 'ClipboardList'),
('surveys', 'all_surveys', 'Alle Umfragen', 2, false, 'LayoutGrid'),
('surveys', 'create', 'Erstellen', 3, false, 'Plus'),
('surveys', 'results', 'Ergebnisse', 4, false, 'BarChart'),
('surveys', 'settings', 'Einstellungen', 5, false, 'Settings')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- DASHBOARD
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('dashboard', 'personal', 'Persönlich', 1, false, 'User'),
('dashboard', 'team', 'Team', 2, true, 'Users'),
('dashboard', 'company', 'Unternehmen', 3, false, 'Building'),
('dashboard', 'analytics', 'Analytics', 4, false, 'BarChart')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- EINSTELLUNGEN
INSERT INTO public.module_menu_items (module_key, menu_key, menu_name, menu_order, requires_team_context, icon) VALUES
('settings', 'profile', 'Mein Profil', 1, false, 'User'),
('settings', 'company', 'Unternehmen', 2, false, 'Building'),
('settings', 'users', 'Benutzer & Rechte', 3, false, 'Users'),
('settings', 'modules', 'Module', 4, false, 'Boxes'),
('settings', 'integrations', 'Integrationen', 5, false, 'Plug'),
('settings', 'security', 'Sicherheit', 6, false, 'Shield'),
('settings', 'billing', 'Abrechnung', 7, false, 'CreditCard')
ON CONFLICT (module_key, menu_key) DO NOTHING;

-- =====================================================
-- 4) 80/20 Default-Berechtigungen für die 4 Rollen
-- (company_id = NULL = globale Defaults)
-- =====================================================

-- MITARBEITER (employee) - Nur eigene Daten
INSERT INTO public.role_menu_permissions (role, module_key, menu_key, is_visible, can_edit, scope, company_id) VALUES
-- Abwesenheit
('employee', 'absence', 'my_absences', true, true, 'own', NULL),
('employee', 'absence', 'calendar', true, false, 'own', NULL),
-- Zeiterfassung
('employee', 'time', 'my_times', true, true, 'own', NULL),
-- Payroll
('employee', 'payroll', 'my_payslips', true, false, 'own', NULL),
-- Projekte
('employee', 'projects', 'my_projects', true, true, 'own', NULL),
('employee', 'projects', 'time_tracking', true, true, 'own', NULL),
-- Onboarding
('employee', 'onboarding', 'my_onboarding', true, false, 'own', NULL),
-- Helpdesk
('employee', 'helpdesk', 'my_tickets', true, true, 'own', NULL),
('employee', 'helpdesk', 'knowledge_base', true, false, 'all', NULL),
-- Dokumente
('employee', 'documents', 'my_documents', true, true, 'own', NULL),
('employee', 'documents', 'shared', true, false, 'all', NULL),
-- Goals
('employee', 'goals', 'my_goals', true, true, 'own', NULL),
-- Performance
('employee', 'performance', 'my_reviews', true, false, 'own', NULL),
-- Schichten
('employee', 'shifts', 'my_shifts', true, false, 'own', NULL),
('employee', 'shifts', 'swap_requests', true, true, 'own', NULL),
-- Reisen
('employee', 'travel', 'my_trips', true, true, 'own', NULL),
('employee', 'travel', 'requests', true, true, 'own', NULL),
-- Spesen
('employee', 'expenses', 'my_expenses', true, true, 'own', NULL),
('employee', 'expenses', 'submit', true, true, 'own', NULL),
-- Innovation
('employee', 'innovation', 'my_ideas', true, true, 'own', NULL),
('employee', 'innovation', 'all_ideas', true, false, 'all', NULL),
('employee', 'innovation', 'voting', true, true, 'all', NULL),
-- Umfragen
('employee', 'surveys', 'my_surveys', true, true, 'own', NULL),
-- Dashboard
('employee', 'dashboard', 'personal', true, false, 'own', NULL),
-- Einstellungen
('employee', 'settings', 'profile', true, true, 'own', NULL)
ON CONFLICT (role, module_key, menu_key, company_id) DO NOTHING;

-- TEAMLEITER (team_lead) - Eigene + Team-Daten
INSERT INTO public.role_menu_permissions (role, module_key, menu_key, is_visible, can_edit, can_approve, scope, company_id) VALUES
-- Abwesenheit
('team_lead', 'absence', 'my_absences', true, true, false, 'own', NULL),
('team_lead', 'absence', 'overview', true, false, false, 'team', NULL),
('team_lead', 'absence', 'team_overview', true, false, false, 'team', NULL),
('team_lead', 'absence', 'approvals', true, false, true, 'team', NULL),
('team_lead', 'absence', 'calendar', true, false, false, 'team', NULL),
-- Zeiterfassung
('team_lead', 'time', 'my_times', true, true, false, 'own', NULL),
('team_lead', 'time', 'overview', true, false, false, 'team', NULL),
('team_lead', 'time', 'team_overview', true, false, false, 'team', NULL),
('team_lead', 'time', 'corrections', true, true, true, 'team', NULL),
-- Payroll
('team_lead', 'payroll', 'my_payslips', true, false, false, 'own', NULL),
-- Projekte
('team_lead', 'projects', 'my_projects', true, true, false, 'own', NULL),
('team_lead', 'projects', 'overview', true, false, false, 'team', NULL),
('team_lead', 'projects', 'time_tracking', true, true, false, 'team', NULL),
('team_lead', 'projects', 'reports', true, false, false, 'team', NULL),
-- Onboarding
('team_lead', 'onboarding', 'my_onboarding', true, false, false, 'own', NULL),
('team_lead', 'onboarding', 'overview', true, false, false, 'team', NULL),
-- Helpdesk
('team_lead', 'helpdesk', 'my_tickets', true, true, false, 'own', NULL),
('team_lead', 'helpdesk', 'knowledge_base', true, false, false, 'all', NULL),
-- Dokumente
('team_lead', 'documents', 'my_documents', true, true, false, 'own', NULL),
('team_lead', 'documents', 'shared', true, true, false, 'team', NULL),
-- Goals
('team_lead', 'goals', 'my_goals', true, true, false, 'own', NULL),
('team_lead', 'goals', 'team_goals', true, true, false, 'team', NULL),
-- Performance
('team_lead', 'performance', 'my_reviews', true, false, false, 'own', NULL),
('team_lead', 'performance', 'team_reviews', true, true, false, 'team', NULL),
-- Schichten
('team_lead', 'shifts', 'my_shifts', true, false, false, 'own', NULL),
('team_lead', 'shifts', 'team_shifts', true, true, false, 'team', NULL),
('team_lead', 'shifts', 'planning', true, true, false, 'team', NULL),
('team_lead', 'shifts', 'swap_requests', true, false, true, 'team', NULL),
-- Reisen
('team_lead', 'travel', 'my_trips', true, true, false, 'own', NULL),
('team_lead', 'travel', 'requests', true, true, false, 'own', NULL),
('team_lead', 'travel', 'approvals', true, false, true, 'team', NULL),
-- Spesen
('team_lead', 'expenses', 'my_expenses', true, true, false, 'own', NULL),
('team_lead', 'expenses', 'submit', true, true, false, 'own', NULL),
('team_lead', 'expenses', 'approvals', true, false, true, 'team', NULL),
-- Innovation
('team_lead', 'innovation', 'my_ideas', true, true, false, 'own', NULL),
('team_lead', 'innovation', 'all_ideas', true, false, false, 'all', NULL),
('team_lead', 'innovation', 'voting', true, true, false, 'all', NULL),
-- Umfragen
('team_lead', 'surveys', 'my_surveys', true, true, false, 'own', NULL),
('team_lead', 'surveys', 'all_surveys', true, false, false, 'team', NULL),
-- Dashboard
('team_lead', 'dashboard', 'personal', true, false, false, 'own', NULL),
('team_lead', 'dashboard', 'team', true, false, false, 'team', NULL),
-- Einstellungen
('team_lead', 'settings', 'profile', true, true, false, 'own', NULL)
ON CONFLICT (role, module_key, menu_key, company_id) DO NOTHING;

-- HR ADMIN (hr_admin) - Alle Daten, HR-Fokus
INSERT INTO public.role_menu_permissions (role, module_key, menu_key, is_visible, can_edit, can_approve, scope, company_id) VALUES
-- Abwesenheit (komplett)
('hr_admin', 'absence', 'my_absences', true, true, false, 'own', NULL),
('hr_admin', 'absence', 'overview', true, true, false, 'all', NULL),
('hr_admin', 'absence', 'team_overview', true, true, false, 'all', NULL),
('hr_admin', 'absence', 'approvals', true, true, true, 'all', NULL),
('hr_admin', 'absence', 'calendar', true, true, false, 'all', NULL),
('hr_admin', 'absence', 'reports', true, true, false, 'all', NULL),
-- Zeiterfassung (komplett)
('hr_admin', 'time', 'my_times', true, true, false, 'own', NULL),
('hr_admin', 'time', 'overview', true, true, false, 'all', NULL),
('hr_admin', 'time', 'team_overview', true, true, false, 'all', NULL),
('hr_admin', 'time', 'corrections', true, true, true, 'all', NULL),
('hr_admin', 'time', 'reports', true, true, false, 'all', NULL),
-- Payroll (komplett)
('hr_admin', 'payroll', 'my_payslips', true, false, false, 'own', NULL),
('hr_admin', 'payroll', 'overview', true, true, false, 'all', NULL),
('hr_admin', 'payroll', 'payroll_run', true, true, false, 'all', NULL),
('hr_admin', 'payroll', 'reports', true, true, false, 'all', NULL),
-- Projekte
('hr_admin', 'projects', 'my_projects', true, true, false, 'own', NULL),
('hr_admin', 'projects', 'overview', true, true, false, 'all', NULL),
('hr_admin', 'projects', 'time_tracking', true, true, false, 'all', NULL),
('hr_admin', 'projects', 'reports', true, true, false, 'all', NULL),
-- Recruiting (komplett)
('hr_admin', 'recruiting', 'dashboard', true, true, false, 'all', NULL),
('hr_admin', 'recruiting', 'jobs', true, true, false, 'all', NULL),
('hr_admin', 'recruiting', 'candidates', true, true, false, 'all', NULL),
('hr_admin', 'recruiting', 'pipeline', true, true, false, 'all', NULL),
('hr_admin', 'recruiting', 'reports', true, true, false, 'all', NULL),
-- Onboarding (komplett)
('hr_admin', 'onboarding', 'my_onboarding', true, false, false, 'own', NULL),
('hr_admin', 'onboarding', 'overview', true, true, false, 'all', NULL),
('hr_admin', 'onboarding', 'templates', true, true, false, 'all', NULL),
('hr_admin', 'onboarding', 'reports', true, true, false, 'all', NULL),
-- Helpdesk
('hr_admin', 'helpdesk', 'my_tickets', true, true, false, 'own', NULL),
('hr_admin', 'helpdesk', 'all_tickets', true, true, false, 'all', NULL),
('hr_admin', 'helpdesk', 'knowledge_base', true, true, false, 'all', NULL),
('hr_admin', 'helpdesk', 'reports', true, true, false, 'all', NULL),
-- Dokumente
('hr_admin', 'documents', 'my_documents', true, true, false, 'own', NULL),
('hr_admin', 'documents', 'shared', true, true, false, 'all', NULL),
('hr_admin', 'documents', 'templates', true, true, false, 'all', NULL),
('hr_admin', 'documents', 'archive', true, true, false, 'all', NULL),
-- Goals
('hr_admin', 'goals', 'my_goals', true, true, false, 'own', NULL),
('hr_admin', 'goals', 'team_goals', true, true, false, 'all', NULL),
('hr_admin', 'goals', 'company_goals', true, true, false, 'all', NULL),
('hr_admin', 'goals', 'reports', true, true, false, 'all', NULL),
-- Performance
('hr_admin', 'performance', 'my_reviews', true, false, false, 'own', NULL),
('hr_admin', 'performance', 'team_reviews', true, true, false, 'all', NULL),
('hr_admin', 'performance', 'cycles', true, true, false, 'all', NULL),
('hr_admin', 'performance', 'reports', true, true, false, 'all', NULL),
-- Schichten
('hr_admin', 'shifts', 'my_shifts', true, false, false, 'own', NULL),
('hr_admin', 'shifts', 'team_shifts', true, true, false, 'all', NULL),
('hr_admin', 'shifts', 'planning', true, true, false, 'all', NULL),
('hr_admin', 'shifts', 'swap_requests', true, true, true, 'all', NULL),
('hr_admin', 'shifts', 'reports', true, true, false, 'all', NULL),
-- Reisen
('hr_admin', 'travel', 'my_trips', true, true, false, 'own', NULL),
('hr_admin', 'travel', 'requests', true, true, false, 'own', NULL),
('hr_admin', 'travel', 'approvals', true, true, true, 'all', NULL),
('hr_admin', 'travel', 'reports', true, true, false, 'all', NULL),
-- Spesen
('hr_admin', 'expenses', 'my_expenses', true, true, false, 'own', NULL),
('hr_admin', 'expenses', 'submit', true, true, false, 'own', NULL),
('hr_admin', 'expenses', 'approvals', true, true, true, 'all', NULL),
('hr_admin', 'expenses', 'reports', true, true, false, 'all', NULL),
-- Innovation
('hr_admin', 'innovation', 'my_ideas', true, true, false, 'own', NULL),
('hr_admin', 'innovation', 'all_ideas', true, true, false, 'all', NULL),
('hr_admin', 'innovation', 'voting', true, true, false, 'all', NULL),
('hr_admin', 'innovation', 'reports', true, true, false, 'all', NULL),
-- Umfragen
('hr_admin', 'surveys', 'my_surveys', true, true, false, 'own', NULL),
('hr_admin', 'surveys', 'all_surveys', true, true, false, 'all', NULL),
('hr_admin', 'surveys', 'create', true, true, false, 'all', NULL),
('hr_admin', 'surveys', 'results', true, true, false, 'all', NULL),
-- Dashboard
('hr_admin', 'dashboard', 'personal', true, false, false, 'own', NULL),
('hr_admin', 'dashboard', 'team', true, false, false, 'all', NULL),
('hr_admin', 'dashboard', 'company', true, false, false, 'all', NULL),
('hr_admin', 'dashboard', 'analytics', true, false, false, 'all', NULL),
-- Einstellungen
('hr_admin', 'settings', 'profile', true, true, false, 'own', NULL),
('hr_admin', 'settings', 'users', true, true, false, 'all', NULL)
ON CONFLICT (role, module_key, menu_key, company_id) DO NOTHING;

-- ADMIN (admin) - Komplett alles
INSERT INTO public.role_menu_permissions (role, module_key, menu_key, is_visible, can_edit, can_approve, scope, company_id)
SELECT 
  'admin',
  module_key,
  menu_key,
  true,
  true,
  true,
  'all',
  NULL
FROM public.module_menu_items
ON CONFLICT (role, module_key, menu_key, company_id) DO NOTHING;

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_role_menu_permissions_role ON public.role_menu_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_menu_permissions_module ON public.role_menu_permissions(module_key);
CREATE INDEX IF NOT EXISTS idx_role_menu_permissions_company ON public.role_menu_permissions(company_id);
CREATE INDEX IF NOT EXISTS idx_module_menu_items_module ON public.module_menu_items(module_key);