-- ============================================
-- Tabelle: settings_module_permissions
-- Speichert rollenbasierte Berechtigungen für Settings-Module
-- ============================================

CREATE TABLE IF NOT EXISTS public.settings_module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  module_id VARCHAR(100) NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  scope VARCHAR(50) DEFAULT 'own' CHECK (scope IN ('own', 'team', 'department', 'global')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT unique_role_module_company UNIQUE(role, module_id, company_id)
);

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_settings_module_permissions_role 
ON public.settings_module_permissions(role);

CREATE INDEX IF NOT EXISTS idx_settings_module_permissions_company 
ON public.settings_module_permissions(company_id);

CREATE INDEX IF NOT EXISTS idx_settings_module_permissions_module 
ON public.settings_module_permissions(module_id);

-- RLS aktivieren
ALTER TABLE public.settings_module_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins können alles verwalten
CREATE POLICY "settings_module_permissions_admin_all"
ON public.settings_module_permissions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

-- Policy: Benutzer können ihre eigenen Berechtigungen lesen (für Frontend-Filterung)
CREATE POLICY "settings_module_permissions_read_own"
ON public.settings_module_permissions
FOR SELECT
TO authenticated
USING (true);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_settings_module_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_settings_module_permissions_updated_at 
ON public.settings_module_permissions;

CREATE TRIGGER trigger_settings_module_permissions_updated_at
BEFORE UPDATE ON public.settings_module_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_settings_module_permissions_updated_at();

-- ============================================
-- Default-Berechtigungen einfügen (ohne company_id für globale Defaults)
-- ============================================

-- Mitarbeiter Berechtigungen
INSERT INTO public.settings_module_permissions (role, module_id, is_visible, can_edit, scope) VALUES
  ('employee', 'dashboard', true, true, 'own'),
  ('employee', 'notifications', true, true, 'own'),
  ('employee', 'absence', true, false, 'own'),
  ('employee', 'calendar', true, false, 'own'),
  ('employee', 'tasks', true, false, 'own')
ON CONFLICT (role, module_id, company_id) DO NOTHING;

-- Teamleiter Berechtigungen
INSERT INTO public.settings_module_permissions (role, module_id, is_visible, can_edit, scope) VALUES
  ('teamlead', 'dashboard', true, true, 'own'),
  ('teamlead', 'notifications', true, true, 'own'),
  ('teamlead', 'absence', true, false, 'team'),
  ('teamlead', 'calendar', true, false, 'team'),
  ('teamlead', 'tasks', true, true, 'team'),
  ('teamlead', 'projects', true, true, 'team'),
  ('teamlead', 'timetracking', true, false, 'team'),
  ('teamlead', 'shift-planning', true, false, 'team'),
  ('teamlead', 'performance', true, false, 'team'),
  ('teamlead', 'training', true, false, 'team')
ON CONFLICT (role, module_id, company_id) DO NOTHING;

-- Manager Berechtigungen
INSERT INTO public.settings_module_permissions (role, module_id, is_visible, can_edit, scope) VALUES
  ('manager', 'dashboard', true, true, 'own'),
  ('manager', 'notifications', true, true, 'own'),
  ('manager', 'absence', true, false, 'department'),
  ('manager', 'calendar', true, false, 'department'),
  ('manager', 'tasks', true, true, 'department'),
  ('manager', 'projects', true, true, 'department'),
  ('manager', 'timetracking', true, false, 'department'),
  ('manager', 'shift-planning', true, false, 'department'),
  ('manager', 'performance', true, false, 'department'),
  ('manager', 'training', true, false, 'department')
ON CONFLICT (role, module_id, company_id) DO NOTHING;

-- HR-Manager Berechtigungen
INSERT INTO public.settings_module_permissions (role, module_id, is_visible, can_edit, scope) VALUES
  ('hr_manager', 'dashboard', true, true, 'global'),
  ('hr_manager', 'notifications', true, true, 'global'),
  ('hr_manager', 'absence', true, true, 'global'),
  ('hr_manager', 'calendar', true, true, 'global'),
  ('hr_manager', 'tasks', true, true, 'global'),
  ('hr_manager', 'projects', true, true, 'global'),
  ('hr_manager', 'timetracking', true, true, 'global'),
  ('hr_manager', 'shift-planning', true, true, 'global'),
  ('hr_manager', 'performance', true, true, 'global'),
  ('hr_manager', 'training', true, true, 'global'),
  ('hr_manager', 'recruiting', true, true, 'global'),
  ('hr_manager', 'onboarding', true, true, 'global'),
  ('hr_manager', 'offboarding', true, true, 'global'),
  ('hr_manager', 'workforce-planning', true, true, 'global'),
  ('hr_manager', 'payroll', true, false, 'global'),
  ('hr_manager', 'expenses', true, true, 'global'),
  ('hr_manager', 'business-travel', true, true, 'global'),
  ('hr_manager', 'assets', true, true, 'global'),
  ('hr_manager', 'knowledge', true, true, 'global'),
  ('hr_manager', 'innovation', true, true, 'global'),
  ('hr_manager', 'helpdesk', true, true, 'global'),
  ('hr_manager', 'rewards', true, true, 'global'),
  ('hr_manager', 'documents', true, true, 'global'),
  ('hr_manager', 'compliance-dashboard', true, true, 'global'),
  ('hr_manager', 'global-mobility', true, true, 'global'),
  ('hr_manager', 'company-info', true, false, 'global'),
  ('hr_manager', 'orgchart', true, true, 'global'),
  ('hr_manager', 'users-roles', true, false, 'global')
ON CONFLICT (role, module_id, company_id) DO NOTHING;