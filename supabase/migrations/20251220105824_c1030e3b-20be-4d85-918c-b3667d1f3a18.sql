-- =============================================
-- ERWEITERE BESTEHENDE TABELLEN
-- =============================================

-- Erweitere feature_flags um fehlende Spalten
ALTER TABLE public.feature_flags 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS scope_type TEXT DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS scope_id UUID,
  ADD COLUMN IF NOT EXISTS is_beta BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Erweitere platform_settings um Wartungsmodus und Sicherheit
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS maintenance_message TEXT,
  ADD COLUMN IF NOT EXISTS maintenance_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS maintenance_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS maintenance_allowed_ips TEXT[],
  ADD COLUMN IF NOT EXISTS maintenance_allowed_roles TEXT[],
  ADD COLUMN IF NOT EXISTS geo_blocking_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS geo_whitelist TEXT[],
  ADD COLUMN IF NOT EXISTS geo_blacklist TEXT[],
  ADD COLUMN IF NOT EXISTS login_time_restrictions JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS max_parallel_sessions INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS force_logout_oldest BOOLEAN DEFAULT true;

-- =============================================
-- NEUE TABELLEN
-- =============================================

-- Sprach-Hierarchie (Sprache pro Gesellschaft/Standort/Rolle)
CREATE TABLE IF NOT EXISTS public.language_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('company', 'location', 'department', 'role', 'user')),
  scope_id UUID,
  language_code TEXT NOT NULL,
  fallback_language TEXT DEFAULT 'de',
  rtl_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, scope_type, scope_id)
);

-- Dashboard-Templates pro Rolle
CREATE TABLE IF NOT EXISTS public.dashboard_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  dashboard_template_id UUID,
  dashboard_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  scope_type TEXT DEFAULT 'company' CHECK (scope_type IN ('company', 'location', 'department')),
  scope_id UUID,
  allow_customization BOOLEAN DEFAULT true,
  allow_multiple_dashboards BOOLEAN DEFAULT true,
  allow_switching BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Widget-Konfiguration & Berechtigungen
CREATE TABLE IF NOT EXISTS public.dashboard_widget_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  widget_id TEXT NOT NULL,
  widget_name TEXT NOT NULL,
  dashboard_template_id UUID,
  is_mandatory BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  allowed_actions JSONB DEFAULT '["view"]',
  drill_down_enabled BOOLEAN DEFAULT true,
  drill_down_roles TEXT[],
  requires_confirmation BOOLEAN DEFAULT false,
  confirmation_message TEXT,
  min_width INTEGER DEFAULT 1,
  min_height INTEGER DEFAULT 1,
  default_position JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- KPI-Alerts & Schwellenwerte
CREATE TABLE IF NOT EXISTS public.dashboard_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  widget_id TEXT NOT NULL,
  kpi_key TEXT NOT NULL,
  kpi_name TEXT NOT NULL,
  threshold_warning NUMERIC,
  threshold_critical NUMERIC,
  comparison_operator TEXT DEFAULT 'gt' CHECK (comparison_operator IN ('gt', 'gte', 'lt', 'lte', 'eq', 'neq')),
  display_mode TEXT DEFAULT 'badge' CHECK (display_mode IN ('banner', 'badge', 'icon', 'popup')),
  escalation_enabled BOOLEAN DEFAULT false,
  escalation_roles TEXT[],
  escalation_delay_minutes INTEGER DEFAULT 60,
  notification_channels TEXT[] DEFAULT ARRAY['in_app'],
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dashboard KI-Einstellungen
CREATE TABLE IF NOT EXISTS public.dashboard_ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT,
  ai_summaries_enabled BOOLEAN DEFAULT true,
  ai_recommendations_enabled BOOLEAN DEFAULT true,
  ai_forecasts_enabled BOOLEAN DEFAULT true,
  natural_language_queries BOOLEAN DEFAULT false,
  explainability_required BOOLEAN DEFAULT true,
  max_tokens_per_query INTEGER DEFAULT 1000,
  allowed_data_sources TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, role)
);

-- Dashboard-Versionen
CREATE TABLE IF NOT EXISTS public.dashboard_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  dashboard_template_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  version_name TEXT,
  config JSONB NOT NULL,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  published_by UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dashboard_template_id, version_number)
);

-- Dashboard-Audit-Log
CREATE TABLE IF NOT EXISTS public.dashboard_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  dashboard_id UUID,
  widget_id TEXT,
  action TEXT NOT NULL,
  action_category TEXT DEFAULT 'configuration',
  old_value JSONB,
  new_value JSONB,
  performed_by UUID,
  performed_by_name TEXT,
  ip_address INET,
  user_agent TEXT,
  performed_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.language_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_audit_log ENABLE ROW LEVEL SECURITY;

-- Language Assignments Policies
CREATE POLICY "Admins can manage language assignments" ON public.language_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Users can view language assignments" ON public.language_assignments
  FOR SELECT USING (true);

-- Dashboard Role Assignments Policies
CREATE POLICY "Admins can manage dashboard assignments" ON public.dashboard_role_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Users can view dashboard assignments" ON public.dashboard_role_assignments
  FOR SELECT USING (true);

-- Dashboard Widget Settings Policies
CREATE POLICY "Admins can manage widget settings" ON public.dashboard_widget_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Users can view widget settings" ON public.dashboard_widget_settings
  FOR SELECT USING (true);

-- Dashboard Alerts Policies
CREATE POLICY "Admins can manage dashboard alerts" ON public.dashboard_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Users can view dashboard alerts" ON public.dashboard_alerts
  FOR SELECT USING (true);

-- Dashboard AI Settings Policies
CREATE POLICY "Admins can manage AI settings" ON public.dashboard_ai_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Users can view AI settings" ON public.dashboard_ai_settings
  FOR SELECT USING (true);

-- Dashboard Versions Policies
CREATE POLICY "Admins can manage dashboard versions" ON public.dashboard_versions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Users can view published versions" ON public.dashboard_versions
  FOR SELECT USING (is_published = true OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- Dashboard Audit Log Policies
CREATE POLICY "Admins can view audit log" ON public.dashboard_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "System can insert audit log" ON public.dashboard_audit_log
  FOR INSERT WITH CHECK (true);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_feature_flags_company ON public.feature_flags(company_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_scope ON public.feature_flags(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_platform_settings_company ON public.platform_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_language_assignments_company ON public.language_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_language_assignments_scope ON public.language_assignments(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_role_company ON public.dashboard_role_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_role_role ON public.dashboard_role_assignments(role);
CREATE INDEX IF NOT EXISTS idx_dashboard_widget_company ON public.dashboard_widget_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_company ON public.dashboard_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_widget ON public.dashboard_alerts(widget_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_ai_company ON public.dashboard_ai_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_versions_template ON public.dashboard_versions(dashboard_template_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_audit_company ON public.dashboard_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_audit_date ON public.dashboard_audit_log(performed_at DESC);