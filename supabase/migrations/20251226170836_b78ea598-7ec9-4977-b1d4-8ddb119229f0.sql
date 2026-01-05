-- Create workflow_settings table only (workflow_templates already exists)
CREATE TABLE IF NOT EXISTS public.workflow_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  -- Berechtigungen
  permissions JSONB DEFAULT '{"create": ["admin", "hr_manager"], "edit": ["admin", "hr_manager", "team_lead"], "delete": ["admin"], "execute": ["admin", "hr_manager", "team_lead", "employee"], "view_logs": ["admin", "hr_manager", "team_lead"], "export_logs": ["admin", "hr_manager"]}',
  visibility_own_only BOOLEAN DEFAULT false,
  visibility_team BOOLEAN DEFAULT true,
  visibility_all BOOLEAN DEFAULT false,
  -- Sicherheit
  require_approval_before_activation BOOLEAN DEFAULT true,
  require_approval_on_change BOOLEAN DEFAULT false,
  four_eyes_principle BOOLEAN DEFAULT true,
  versioning_enabled BOOLEAN DEFAULT true,
  audit_modules TEXT[] DEFAULT ARRAY['absence', 'sick_leave', 'time_tracking', 'payroll', 'recruiting', 'onboarding', 'performance', 'expenses', 'projects', 'documents', 'compliance'],
  -- KI-Einstellungen
  ai_generation_enabled BOOLEAN DEFAULT true,
  ai_explanations_enabled BOOLEAN DEFAULT true,
  ai_optimization_enabled BOOLEAN DEFAULT true,
  ai_translation_enabled BOOLEAN DEFAULT false,
  ai_auto_decisions BOOLEAN DEFAULT false,
  ai_confidence_threshold INTEGER DEFAULT 85,
  ai_logging_enabled BOOLEAN DEFAULT true,
  ai_data_retention_days INTEGER DEFAULT 90,
  -- Integrationen
  sevdesk_enabled BOOLEAN DEFAULT false,
  sevdesk_api_key TEXT,
  sevdesk_tenant_id TEXT,
  datev_enabled BOOLEAN DEFAULT false,
  datev_api_key TEXT,
  datev_tenant_id TEXT,
  slack_enabled BOOLEAN DEFAULT false,
  slack_api_key TEXT,
  slack_tenant_id TEXT,
  ms_teams_enabled BOOLEAN DEFAULT false,
  webhooks_enabled BOOLEAN DEFAULT true,
  -- Performance
  max_parallel_workflows INTEGER DEFAULT 50,
  max_workflow_duration_seconds INTEGER DEFAULT 300,
  retry_strategy TEXT DEFAULT 'exponential',
  max_retries INTEGER DEFAULT 3,
  notify_on_error BOOLEAN DEFAULT true,
  -- Datenschutz
  gdpr_compliant BOOLEAN DEFAULT true,
  pii_masking_enabled BOOLEAN DEFAULT true,
  log_encryption_enabled BOOLEAN DEFAULT true,
  log_retention_days INTEGER DEFAULT 365,
  log_access_roles TEXT[] DEFAULT ARRAY['admin', 'revisor'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_settings
CREATE POLICY "Users can view workflow settings" ON public.workflow_settings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert workflow settings" ON public.workflow_settings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update workflow settings" ON public.workflow_settings
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Index
CREATE INDEX IF NOT EXISTS idx_workflow_settings_company ON public.workflow_settings(company_id);

-- Add missing columns to workflow_templates if needed
ALTER TABLE public.workflow_templates ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;