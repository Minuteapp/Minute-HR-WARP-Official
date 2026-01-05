
-- =====================================================
-- INNOVATION-EINSTELLUNGEN TABELLEN
-- =====================================================

-- 1. Tabelle für globale Innovation Hub Einstellungen
CREATE TABLE public.innovation_hub_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  -- Aktivierung
  hub_enabled BOOLEAN DEFAULT true,
  scope TEXT DEFAULT 'company', -- 'company', 'subsidiaries', 'locations'
  scope_entities UUID[] DEFAULT '{}',
  -- Innovationsarten
  enabled_idea_types JSONB DEFAULT '["open_ideas", "strategic", "process", "product", "esg"]',
  -- Lifecycle & Status
  status_model JSONB DEFAULT '[
    {"key": "submitted", "label": "Eingereicht", "color": "#3B82F6", "order": 1},
    {"key": "in_review", "label": "In Prüfung", "color": "#F59E0B", "order": 2},
    {"key": "in_evaluation", "label": "In Bewertung", "color": "#8B5CF6", "order": 3},
    {"key": "approved", "label": "Genehmigt", "color": "#10B981", "order": 4},
    {"key": "rejected", "label": "Abgelehnt", "color": "#EF4444", "order": 5},
    {"key": "in_implementation", "label": "In Umsetzung", "color": "#06B6D4", "order": 6},
    {"key": "completed", "label": "Abgeschlossen", "color": "#22C55E", "order": 7},
    {"key": "archived", "label": "Archiviert", "color": "#6B7280", "order": 8}
  ]',
  require_status_order BOOLEAN DEFAULT true,
  min_days_per_status INTEGER DEFAULT 0,
  auto_transitions JSONB DEFAULT '{}',
  -- Einreichungsregeln
  submission_roles JSONB DEFAULT '["all"]',
  required_fields JSONB DEFAULT '["title", "description", "category"]',
  allow_anonymous BOOLEAN DEFAULT false,
  allow_team_submissions BOOLEAN DEFAULT true,
  allow_attachments BOOLEAN DEFAULT true,
  max_attachments INTEGER DEFAULT 5,
  max_attachment_size_mb INTEGER DEFAULT 10,
  -- Bewertung
  evaluation_model TEXT DEFAULT 'points', -- 'points', 'voting', 'expert', 'ai', 'combined'
  allowed_evaluator_roles JSONB DEFAULT '["peer", "team_lead", "innovation_board", "management"]',
  min_evaluators INTEGER DEFAULT 3,
  min_score_for_approval INTEGER DEFAULT 70,
  voting_duration_days INTEGER DEFAULT 7,
  ai_pre_evaluation BOOLEAN DEFAULT false,
  -- Umsetzung
  auto_create_project BOOLEAN DEFAULT false,
  auto_create_tasks BOOLEAN DEFAULT false,
  auto_create_roadmap_item BOOLEAN DEFAULT false,
  require_budget_approval BOOLEAN DEFAULT true,
  budget_approval_threshold NUMERIC(12,2) DEFAULT 0,
  auto_assign_responsible BOOLEAN DEFAULT false,
  -- KI
  ai_clustering BOOLEAN DEFAULT false,
  ai_duplicate_detection BOOLEAN DEFAULT true,
  ai_impact_prediction BOOLEAN DEFAULT false,
  ai_suggestions BOOLEAN DEFAULT false,
  ai_summaries BOOLEAN DEFAULT false,
  -- Reporting
  show_statistics_to_all BOOLEAN DEFAULT false,
  anonymize_reports BOOLEAN DEFAULT true,
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id)
);

-- 2. Tabelle für Innovation Challenges
CREATE TABLE public.innovation_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_roles JSONB DEFAULT '[]',
  target_teams JSONB DEFAULT '[]',
  target_locations JSONB DEFAULT '[]',
  categories JSONB DEFAULT '[]',
  reward_type TEXT, -- 'monetary', 'recognition', 'time_off', 'custom'
  reward_value NUMERIC(12,2),
  reward_description TEXT,
  allow_multiple_submissions BOOLEAN DEFAULT true,
  max_submissions_per_person INTEGER,
  allow_team_challenges BOOLEAN DEFAULT false,
  min_team_size INTEGER DEFAULT 2,
  max_team_size INTEGER DEFAULT 5,
  evaluation_criteria JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'active', 'voting', 'completed', 'archived'
  winner_idea_ids UUID[] DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabelle für Bewertungskriterien
CREATE TABLE public.innovation_evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  description TEXT,
  weight INTEGER DEFAULT 10,
  scale_min INTEGER DEFAULT 1,
  scale_max INTEGER DEFAULT 5,
  scale_labels JSONB DEFAULT '{}', -- {"1": "Sehr gering", "5": "Sehr hoch"}
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  applies_to_types JSONB DEFAULT '["all"]',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabelle für Innovation Berechtigungen
CREATE TABLE public.innovation_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL, -- 'employee', 'team_lead', 'innovation_board', 'hr', 'management', 'admin', 'superadmin'
  can_submit BOOLEAN DEFAULT true,
  can_view_all BOOLEAN DEFAULT false,
  can_comment BOOLEAN DEFAULT true,
  can_vote BOOLEAN DEFAULT true,
  can_evaluate BOOLEAN DEFAULT false,
  can_decide BOOLEAN DEFAULT false,
  can_manage_challenges BOOLEAN DEFAULT false,
  can_configure BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  can_audit BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, role_type)
);

-- =====================================================
-- WORKFLOW-EINSTELLUNGEN TABELLEN
-- =====================================================

-- 5. Tabelle für globale Workflow Einstellungen
CREATE TABLE public.workflow_global_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  -- Grundlagen
  workflows_enabled BOOLEAN DEFAULT true,
  enabled_modules JSONB DEFAULT '["all"]',
  manual_workflows_allowed BOOLEAN DEFAULT true,
  sandbox_mode BOOLEAN DEFAULT false,
  sandbox_notify_only BOOLEAN DEFAULT true,
  -- Zeit & Eskalation
  default_timeout_hours INTEGER DEFAULT 48,
  reminder_before_hours INTEGER[] DEFAULT '{24, 48}',
  escalation_levels INTEGER DEFAULT 3,
  escalation_interval_hours INTEGER DEFAULT 24,
  auto_cancel_after_days INTEGER,
  auto_complete_after_days INTEGER,
  -- Genehmigungsketten
  allow_parallel_approvals BOOLEAN DEFAULT true,
  allow_delegation BOOLEAN DEFAULT true,
  require_deputy_for_absence BOOLEAN DEFAULT true,
  skip_absent_approvers BOOLEAN DEFAULT false,
  -- KI
  ai_approver_suggestion BOOLEAN DEFAULT false,
  ai_risk_detection BOOLEAN DEFAULT false,
  ai_decision_recommendation BOOLEAN DEFAULT false,
  ai_explain_decisions BOOLEAN DEFAULT false,
  -- Versionierung
  enable_versioning BOOLEAN DEFAULT true,
  max_versions_kept INTEGER DEFAULT 10,
  enable_simulation BOOLEAN DEFAULT true,
  allow_rollback BOOLEAN DEFAULT true,
  require_approval_for_changes BOOLEAN DEFAULT true,
  -- Monitoring
  enable_analytics BOOLEAN DEFAULT true,
  track_bottlenecks BOOLEAN DEFAULT true,
  alert_on_delays BOOLEAN DEFAULT true,
  delay_threshold_hours INTEGER DEFAULT 72,
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id)
);

-- 6. Tabelle für Workflow Trigger
CREATE TABLE public.workflow_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL, -- 'absence', 'expense', 'project', 'onboarding', 'offboarding', 'innovation', 'document', 'asset', 'time_tracking'
  trigger_event TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'deadline_passed', 'employee_started', 'employee_ended', 'approved', 'rejected', 'amount_exceeded'
  trigger_conditions JSONB DEFAULT '{}', -- Zusätzliche Bedingungen für den Trigger
  is_active BOOLEAN DEFAULT true,
  linked_workflow_template_id UUID REFERENCES public.workflow_templates(id) ON DELETE SET NULL,
  priority INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabelle für Workflow Bedingungen
CREATE TABLE public.workflow_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
  workflow_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
  condition_group INTEGER DEFAULT 0, -- Für Gruppierung von Bedingungen
  condition_type TEXT NOT NULL, -- 'role', 'location', 'department', 'amount', 'duration', 'risk_score', 'absence_type', 'project_type', 'custom_field'
  field_path TEXT, -- z.B. 'request.amount' oder 'employee.department'
  operator TEXT NOT NULL, -- 'equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'contains', 'not_contains', 'in', 'not_in', 'is_empty', 'is_not_empty'
  value JSONB NOT NULL,
  logic_operator TEXT DEFAULT 'AND', -- 'AND', 'OR'
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Tabelle für Workflow Aktionen
CREATE TABLE public.workflow_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
  workflow_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'change_status', 'create_task', 'send_notification', 'send_email', 'create_project', 'generate_document', 'call_webhook', 'call_api', 'start_ai_analysis', 'assign_asset', 'create_calendar_event', 'update_field', 'custom'
  action_name TEXT NOT NULL,
  action_config JSONB NOT NULL, -- Konfiguration abhängig vom action_type
  execute_on TEXT DEFAULT 'approval', -- 'approval', 'rejection', 'timeout', 'escalation', 'always', 'condition_met'
  execute_condition JSONB, -- Optionale zusätzliche Bedingung
  delay_minutes INTEGER DEFAULT 0,
  retry_on_failure BOOLEAN DEFAULT false,
  max_retries INTEGER DEFAULT 3,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Tabelle für Genehmiger-Regeln
CREATE TABLE public.workflow_approver_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
  workflow_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  approver_type TEXT NOT NULL, -- 'direct_manager', 'skip_level_manager', 'role_based', 'department_head', 'location_manager', 'custom_user', 'dynamic', 'group'
  approver_role TEXT, -- Wenn role_based
  approver_user_id UUID, -- Wenn custom_user
  approver_group_id UUID, -- Wenn group
  dynamic_rule JSONB, -- z.B. {"type": "budget_owner", "condition": "amount > 1000"}
  step_number INTEGER DEFAULT 1,
  approval_mode TEXT DEFAULT 'sequential', -- 'sequential', 'parallel', 'any_one', 'all_required', 'majority'
  required_approvals INTEGER DEFAULT 1, -- Bei parallel/majority
  can_delegate BOOLEAN DEFAULT true,
  can_reassign BOOLEAN DEFAULT false,
  auto_approve_conditions JSONB, -- Bedingungen für automatische Genehmigung
  timeout_action TEXT DEFAULT 'escalate', -- 'escalate', 'auto_approve', 'auto_reject', 'remind'
  is_optional BOOLEAN DEFAULT false,
  skip_conditions JSONB, -- Bedingungen zum Überspringen dieses Schritts
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Tabelle für Workflow Berechtigungen
CREATE TABLE public.workflow_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL,
  can_trigger BOOLEAN DEFAULT true,
  can_view_own BOOLEAN DEFAULT true,
  can_view_team BOOLEAN DEFAULT false,
  can_view_all BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  can_reject BOOLEAN DEFAULT false,
  can_delegate BOOLEAN DEFAULT false,
  can_escalate BOOLEAN DEFAULT false,
  can_cancel BOOLEAN DEFAULT false,
  can_configure BOOLEAN DEFAULT false,
  can_create_templates BOOLEAN DEFAULT false,
  can_override BOOLEAN DEFAULT false,
  can_simulate BOOLEAN DEFAULT false,
  can_audit BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, role_type)
);

-- =====================================================
-- INDIZES
-- =====================================================

CREATE INDEX idx_innovation_hub_settings_company ON public.innovation_hub_settings(company_id);
CREATE INDEX idx_innovation_challenges_company ON public.innovation_challenges(company_id);
CREATE INDEX idx_innovation_challenges_status ON public.innovation_challenges(status);
CREATE INDEX idx_innovation_challenges_dates ON public.innovation_challenges(start_date, end_date);
CREATE INDEX idx_innovation_evaluation_criteria_company ON public.innovation_evaluation_criteria(company_id);
CREATE INDEX idx_innovation_permissions_company ON public.innovation_permissions(company_id);

CREATE INDEX idx_workflow_global_settings_company ON public.workflow_global_settings(company_id);
CREATE INDEX idx_workflow_triggers_company ON public.workflow_triggers(company_id);
CREATE INDEX idx_workflow_triggers_module ON public.workflow_triggers(module);
CREATE INDEX idx_workflow_triggers_event ON public.workflow_triggers(trigger_event);
CREATE INDEX idx_workflow_conditions_template ON public.workflow_conditions(workflow_template_id);
CREATE INDEX idx_workflow_conditions_step ON public.workflow_conditions(workflow_step_id);
CREATE INDEX idx_workflow_actions_template ON public.workflow_actions(workflow_template_id);
CREATE INDEX idx_workflow_actions_step ON public.workflow_actions(workflow_step_id);
CREATE INDEX idx_workflow_approver_rules_template ON public.workflow_approver_rules(workflow_template_id);
CREATE INDEX idx_workflow_approver_rules_step ON public.workflow_approver_rules(workflow_step_id);
CREATE INDEX idx_workflow_permissions_company ON public.workflow_permissions(company_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.innovation_hub_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_approver_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies für Innovation Tabellen
CREATE POLICY "Users can view innovation hub settings" ON public.innovation_hub_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage innovation hub settings" ON public.innovation_hub_settings FOR ALL USING (true);

CREATE POLICY "Users can view innovation challenges" ON public.innovation_challenges FOR SELECT USING (true);
CREATE POLICY "Admins can manage innovation challenges" ON public.innovation_challenges FOR ALL USING (true);

CREATE POLICY "Users can view innovation evaluation criteria" ON public.innovation_evaluation_criteria FOR SELECT USING (true);
CREATE POLICY "Admins can manage innovation evaluation criteria" ON public.innovation_evaluation_criteria FOR ALL USING (true);

CREATE POLICY "Users can view innovation permissions" ON public.innovation_permissions FOR SELECT USING (true);
CREATE POLICY "Admins can manage innovation permissions" ON public.innovation_permissions FOR ALL USING (true);

-- RLS Policies für Workflow Tabellen
CREATE POLICY "Users can view workflow global settings" ON public.workflow_global_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage workflow global settings" ON public.workflow_global_settings FOR ALL USING (true);

CREATE POLICY "Users can view workflow triggers" ON public.workflow_triggers FOR SELECT USING (true);
CREATE POLICY "Admins can manage workflow triggers" ON public.workflow_triggers FOR ALL USING (true);

CREATE POLICY "Users can view workflow conditions" ON public.workflow_conditions FOR SELECT USING (true);
CREATE POLICY "Admins can manage workflow conditions" ON public.workflow_conditions FOR ALL USING (true);

CREATE POLICY "Users can view workflow actions" ON public.workflow_actions FOR SELECT USING (true);
CREATE POLICY "Admins can manage workflow actions" ON public.workflow_actions FOR ALL USING (true);

CREATE POLICY "Users can view workflow approver rules" ON public.workflow_approver_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage workflow approver rules" ON public.workflow_approver_rules FOR ALL USING (true);

CREATE POLICY "Users can view workflow permissions" ON public.workflow_permissions FOR SELECT USING (true);
CREATE POLICY "Admins can manage workflow permissions" ON public.workflow_permissions FOR ALL USING (true);

-- =====================================================
-- TRIGGER FÜR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_innovation_hub_settings_updated_at BEFORE UPDATE ON public.innovation_hub_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_innovation_challenges_updated_at BEFORE UPDATE ON public.innovation_challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_innovation_evaluation_criteria_updated_at BEFORE UPDATE ON public.innovation_evaluation_criteria FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workflow_global_settings_updated_at BEFORE UPDATE ON public.workflow_global_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workflow_triggers_updated_at BEFORE UPDATE ON public.workflow_triggers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- DEFAULT DATEN
-- =====================================================

-- Default Bewertungskriterien
INSERT INTO public.innovation_evaluation_criteria (company_id, name, key, description, weight, scale_min, scale_max, sort_order) VALUES
(NULL, 'Impact', 'impact', 'Potenzielle Auswirkung auf das Unternehmen', 30, 1, 5, 1),
(NULL, 'Machbarkeit', 'feasibility', 'Technische und organisatorische Umsetzbarkeit', 25, 1, 5, 2),
(NULL, 'Aufwand', 'effort', 'Benötigte Ressourcen und Zeit', 20, 1, 5, 3),
(NULL, 'Strategiefit', 'strategy_fit', 'Passung zur Unternehmensstrategie', 15, 1, 5, 4),
(NULL, 'Innovation', 'innovation_level', 'Grad der Neuheit und Kreativität', 10, 1, 5, 5);
