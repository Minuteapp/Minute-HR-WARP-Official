-- KI-Modul: Comprehensive AI Governance & Management System
-- Haupttabelle für KI-Modelle und Tools
CREATE TABLE public.ai_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- OpenAI, Anthropic, Google, etc.
  version TEXT,
  description TEXT,
  category TEXT NOT NULL, -- text_generation, image_analysis, prediction, etc.
  dsgvo_status TEXT NOT NULL DEFAULT 'pending', -- approved, pending, rejected, in_review
  responsible_owner_id UUID,
  responsible_owner_name TEXT,
  cost_model TEXT, -- per_call, per_token, monthly_flat, etc.
  cost_per_call NUMERIC DEFAULT 0,
  cost_per_token NUMERIC DEFAULT 0,
  monthly_cost NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  compliance_notes TEXT,
  audit_document_path TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- KI-Nutzungslogs für Analytics
CREATE TABLE public.ai_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_model_id UUID REFERENCES public.ai_models(id),
  user_id UUID NOT NULL,
  employee_name TEXT,
  department TEXT,
  module_used TEXT, -- recruiting, chat, forecast, etc.
  task_description TEXT,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_incurred NUMERIC DEFAULT 0,
  time_saved_minutes INTEGER DEFAULT 0,
  efficiency_score NUMERIC DEFAULT 0, -- 1-10 scale
  usage_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_id TEXT,
  ip_address INET,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Vorschlagsportal für neue KI-UseCases
CREATE TABLE public.ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_by UUID NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  suggestion_title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_module TEXT, -- which module it should be integrated into
  expected_benefit TEXT,
  use_case_type TEXT, -- automation, analysis, generation, etc.
  priority TEXT DEFAULT 'medium', -- low, medium, high, critical
  estimated_roi NUMERIC,
  status TEXT DEFAULT 'pending', -- pending, in_review, approved, rejected, implemented
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_comments TEXT,
  implementation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- DSGVO & Compliance Audits
CREATE TABLE public.ai_compliance_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_model_id UUID REFERENCES public.ai_models(id),
  audit_type TEXT NOT NULL, -- dsgvo, security, privacy, ethics
  audit_status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, passed, failed
  auditor_id UUID,
  auditor_name TEXT,
  audit_date DATE,
  compliance_score INTEGER, -- 0-100
  findings TEXT,
  recommendations TEXT,
  risk_level TEXT DEFAULT 'medium', -- low, medium, high, critical
  remediation_required BOOLEAN DEFAULT false,
  remediation_deadline DATE,
  document_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- KI-Team Approval Workflows
CREATE TABLE public.ai_team_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_type TEXT NOT NULL, -- new_model, suggestion, compliance_review
  reference_id UUID NOT NULL, -- ai_model_id or ai_suggestion_id
  workflow_step TEXT DEFAULT 'initial_review', -- initial_review, dsgvo_check, technical_review, final_approval
  assigned_to UUID,
  assigned_to_name TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, approved, rejected, escalated
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  comments TEXT,
  decision_rationale TEXT,
  escalation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- KI-Kostentracking & Budget
CREATE TABLE public.ai_cost_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_model_id UUID REFERENCES public.ai_models(id),
  tracking_period_start DATE NOT NULL,
  tracking_period_end DATE NOT NULL,
  department TEXT,
  total_usage_count INTEGER DEFAULT 0,
  total_tokens_used BIGINT DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  budget_allocated NUMERIC DEFAULT 0,
  budget_remaining NUMERIC DEFAULT 0,
  cost_per_user NUMERIC DEFAULT 0,
  efficiency_metrics JSONB DEFAULT '{}'::jsonb,
  savings_achieved NUMERIC DEFAULT 0, -- money saved through automation
  time_saved_hours NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Automatisierungsvorschläge & Discovery
CREATE TABLE public.ai_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_name TEXT NOT NULL,
  current_module TEXT NOT NULL,
  automation_type TEXT NOT NULL, -- full_automation, partial_automation, ai_assistance
  description TEXT NOT NULL,
  current_time_spent_hours NUMERIC DEFAULT 0,
  potential_time_saved_hours NUMERIC DEFAULT 0,
  automation_confidence_score NUMERIC DEFAULT 0, -- 0-1 (percentage)
  implementation_cost NUMERIC DEFAULT 0,
  annual_savings NUMERIC DEFAULT 0,
  roi_percentage NUMERIC DEFAULT 0,
  complexity_level TEXT DEFAULT 'medium', -- low, medium, high
  required_ai_models TEXT[],
  status TEXT DEFAULT 'suggested', -- suggested, in_review, approved, in_development, implemented, rejected
  reviewed_by UUID,
  implementation_priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- KI-Alerts & Notifications
CREATE TABLE public.ai_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL, -- compliance_violation, budget_exceeded, high_usage, new_suggestion, etc.
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  affected_ai_model_id UUID REFERENCES public.ai_models(id),
  affected_user_id UUID,
  triggered_by_usage_log_id UUID REFERENCES public.ai_usage_logs(id),
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Predictive Forecasts & Scenarios
CREATE TABLE public.ai_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_name TEXT NOT NULL,
  scenario_type TEXT NOT NULL, -- conservative, optimistic, aggressive
  ai_model_id UUID REFERENCES public.ai_models(id),
  forecast_period_months INTEGER NOT NULL,
  current_monthly_usage INTEGER DEFAULT 0,
  predicted_monthly_usage INTEGER DEFAULT 0,
  current_monthly_cost NUMERIC DEFAULT 0,
  predicted_monthly_cost NUMERIC DEFAULT 0,
  growth_assumptions JSONB DEFAULT '{}'::jsonb,
  confidence_level NUMERIC DEFAULT 0.8, -- 0-1
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on all tables
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_compliance_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_team_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_forecasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- AI Models - everyone can view, admins can manage
CREATE POLICY "ai_models_select" ON public.ai_models FOR SELECT USING (true);
CREATE POLICY "ai_models_insert" ON public.ai_models FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);
CREATE POLICY "ai_models_update" ON public.ai_models FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Usage Logs - users can insert their own, admins can view all
CREATE POLICY "ai_usage_logs_select" ON public.ai_usage_logs FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);
CREATE POLICY "ai_usage_logs_insert" ON public.ai_usage_logs FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- Suggestions - users can create and view their own, admins can view all
CREATE POLICY "ai_suggestions_select" ON public.ai_suggestions FOR SELECT USING (
  submitted_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);
CREATE POLICY "ai_suggestions_insert" ON public.ai_suggestions FOR INSERT WITH CHECK (
  submitted_by = auth.uid()
);
CREATE POLICY "ai_suggestions_update" ON public.ai_suggestions FOR UPDATE USING (
  submitted_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Compliance Audits - admins only
CREATE POLICY "ai_compliance_audits_all" ON public.ai_compliance_audits FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Team Approvals - admins only
CREATE POLICY "ai_team_approvals_all" ON public.ai_team_approvals FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Cost Tracking - everyone can view
CREATE POLICY "ai_cost_tracking_select" ON public.ai_cost_tracking FOR SELECT USING (true);
CREATE POLICY "ai_cost_tracking_manage" ON public.ai_cost_tracking FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Automations - everyone can view, admins can manage
CREATE POLICY "ai_automations_select" ON public.ai_automations FOR SELECT USING (true);
CREATE POLICY "ai_automations_manage" ON public.ai_automations FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Alerts - users see their own, admins see all
CREATE POLICY "ai_alerts_select" ON public.ai_alerts FOR SELECT USING (
  affected_user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);
CREATE POLICY "ai_alerts_manage" ON public.ai_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Forecasts - everyone can view, admins can manage
CREATE POLICY "ai_forecasts_select" ON public.ai_forecasts FOR SELECT USING (true);
CREATE POLICY "ai_forecasts_manage" ON public.ai_forecasts FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Create indexes for better performance
CREATE INDEX idx_ai_usage_logs_user_date ON public.ai_usage_logs(user_id, usage_date);
CREATE INDEX idx_ai_usage_logs_model_date ON public.ai_usage_logs(ai_model_id, usage_date);
CREATE INDEX idx_ai_suggestions_status ON public.ai_suggestions(status);
CREATE INDEX idx_ai_compliance_audits_model ON public.ai_compliance_audits(ai_model_id);
CREATE INDEX idx_ai_team_approvals_status ON public.ai_team_approvals(status);
CREATE INDEX idx_ai_alerts_read ON public.ai_alerts(is_read, created_at);

-- Insert some initial AI models data
INSERT INTO public.ai_models (name, provider, version, description, category, dsgvo_status, cost_model, cost_per_call, responsible_owner_name) VALUES
('GPT-4', 'OpenAI', '4.0', 'Großes Sprachmodell für Textgenerierung und -analyse', 'text_generation', 'approved', 'per_token', 0.00003, 'IT-Team'),
('GPT-3.5 Turbo', 'OpenAI', '3.5', 'Schnelles Sprachmodell für Chat und einfache Aufgaben', 'text_generation', 'approved', 'per_token', 0.000002, 'IT-Team'),
('Claude 3.5 Sonnet', 'Anthropic', '3.5', 'Leistungsstarkes Modell für komplexe Reasoning-Aufgaben', 'text_generation', 'in_review', 'per_token', 0.00003, 'IT-Team'),
('DALL-E 3', 'OpenAI', '3.0', 'Bildgenerierung aus Textbeschreibungen', 'image_generation', 'pending', 'per_call', 0.04, 'Design-Team'),
('Midjourney', 'Midjourney Inc.', 'v6', 'Professionelle Bildgenerierung', 'image_generation', 'rejected', 'monthly_flat', 30, 'Design-Team');

-- Insert some initial automation suggestions
INSERT INTO public.ai_automations (process_name, current_module, automation_type, description, current_time_spent_hours, potential_time_saved_hours, automation_confidence_score, annual_savings, roi_percentage) VALUES
('Bewerbungsscreening', 'recruiting', 'partial_automation', 'Automatische Vorauswahl von Bewerbungen basierend auf Kriterien', 120, 75, 0.85, 25000, 450),
('Rechnungsprüfung', 'expenses', 'full_automation', 'Vollautomatische Prüfung von Eingangsrechnungen', 80, 70, 0.92, 18000, 380),
('Zeiterfassung-Anomalieerkennung', 'time-tracking', 'ai_assistance', 'KI-gestützte Erkennung von ungewöhnlichen Zeitbuchungen', 40, 30, 0.78, 8000, 200);