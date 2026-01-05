
-- Compliance Hub Core Tables

-- Main compliance cases/processes table
CREATE TABLE public.compliance_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  case_type TEXT NOT NULL, -- 'gdpr_request', 'policy_violation', 'audit', 'incident', 'risk_assessment'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'closed', 'escalated'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  assigned_to UUID REFERENCES auth.users(id),
  reported_by UUID REFERENCES auth.users(id),
  department TEXT,
  location TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Policies and guidelines management
CREATE TABLE public.compliance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  policy_type TEXT NOT NULL, -- 'code_of_conduct', 'data_protection', 'it_security', 'hr_policy'
  content TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  language TEXT DEFAULT 'de',
  requires_acknowledgment BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  file_path TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Policy acknowledgments tracking
CREATE TABLE public.policy_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES public.compliance_policies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  digital_signature TEXT,
  reminder_sent_count INTEGER DEFAULT 0,
  last_reminder_sent TIMESTAMP WITH TIME ZONE,
  UNIQUE(policy_id, user_id)
);

-- Compliance audits management
CREATE TABLE public.compliance_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_name TEXT NOT NULL,
  audit_type TEXT NOT NULL, -- 'internal', 'external', 'regulatory'
  scope TEXT, -- 'gdpr', 'iso27001', 'occupational_safety'
  auditor_name TEXT,
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  status TEXT DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'cancelled'
  findings_count INTEGER DEFAULT 0,
  critical_findings INTEGER DEFAULT 0,
  overall_rating TEXT, -- 'excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'
  report_file_path TEXT,
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit findings and corrective actions
CREATE TABLE public.audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.compliance_audits(id) ON DELETE CASCADE,
  finding_title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  category TEXT, -- 'process', 'documentation', 'technical', 'training'
  responsible_person UUID REFERENCES auth.users(id),
  due_date DATE,
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'overdue'
  corrective_action TEXT,
  completion_date DATE,
  evidence_file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Compliance incidents and violations
CREATE TABLE public.compliance_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_type TEXT NOT NULL, -- 'data_breach', 'policy_violation', 'regulatory_breach', 'whistleblower'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  department TEXT,
  location TEXT,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reported_by UUID REFERENCES auth.users(id),
  is_anonymous BOOLEAN DEFAULT false,
  investigation_status TEXT DEFAULT 'reported', -- 'reported', 'investigating', 'resolved', 'escalated'
  assigned_investigator UUID REFERENCES auth.users(id),
  resolution TEXT,
  corrective_actions JSONB DEFAULT '[]'::jsonb,
  notification_authorities BOOLEAN DEFAULT false,
  notification_date TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Whistleblower system (anonymous reporting)
CREATE TABLE public.whistleblower_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_token TEXT UNIQUE NOT NULL, -- For anonymous access
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'corruption', 'harassment', 'safety', 'discrimination', 'other'
  anonymity_level TEXT NOT NULL DEFAULT 'anonymous', -- 'anonymous', 'confidential', 'identified'
  status TEXT DEFAULT 'submitted', -- 'submitted', 'under_review', 'investigating', 'resolved', 'closed'
  severity_assessment TEXT, -- 'low', 'medium', 'high', 'critical'
  department_affected TEXT,
  location_affected TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  communication_log JSONB DEFAULT '[]'::jsonb,
  encrypted_details TEXT, -- Encrypted sensitive information
  ip_hash TEXT, -- Hashed IP for security
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Compliance calendar and deadlines
CREATE TABLE public.compliance_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  deadline_type TEXT NOT NULL, -- 'policy_review', 'audit_due', 'certification_renewal', 'report_submission'
  due_date DATE NOT NULL,
  responsible_person UUID REFERENCES auth.users(id),
  department TEXT,
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'due', 'overdue', 'completed', 'cancelled'
  reminder_days INTEGER[] DEFAULT '{7,3,1}'::integer[], -- Days before deadline to send reminders
  last_reminder_sent TIMESTAMP WITH TIME ZONE,
  completion_date DATE,
  completion_notes TEXT,
  recurring_pattern TEXT, -- 'yearly', 'quarterly', 'monthly', 'custom'
  next_occurrence DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Risk assessments and management
CREATE TABLE public.compliance_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_title TEXT NOT NULL,
  description TEXT NOT NULL,
  risk_category TEXT NOT NULL, -- 'legal', 'operational', 'financial', 'reputational', 'strategic'
  likelihood INTEGER NOT NULL CHECK (likelihood >= 1 AND likelihood <= 5), -- 1=rare, 5=almost certain
  impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5), -- 1=insignificant, 5=catastrophic
  risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
  current_controls TEXT,
  mitigation_plan TEXT,
  risk_owner UUID REFERENCES auth.users(id),
  department TEXT,
  status TEXT DEFAULT 'identified', -- 'identified', 'assessed', 'mitigating', 'monitoring', 'closed'
  review_date DATE,
  last_reviewed DATE,
  next_review_date DATE,
  residual_likelihood INTEGER CHECK (residual_likelihood >= 1 AND residual_likelihood <= 5),
  residual_impact INTEGER CHECK (residual_impact >= 1 AND residual_impact <= 5),
  residual_risk_score INTEGER GENERATED ALWAYS AS (COALESCE(residual_likelihood, likelihood) * COALESCE(residual_impact, impact)) STORED,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Compliance reports generation
CREATE TABLE public.compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'audit_summary', 'risk_dashboard', 'policy_compliance', 'incident_analysis'
  report_period_start DATE,
  report_period_end DATE,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  file_path TEXT,
  file_size BIGINT,
  parameters JSONB DEFAULT '{}'::jsonb, -- Filter parameters used
  recipients JSONB DEFAULT '[]'::jsonb, -- Who received the report
  status TEXT DEFAULT 'generated', -- 'generated', 'sent', 'archived'
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Compliance metrics and KPIs
CREATE TABLE public.compliance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- 'kpi', 'trend', 'benchmark'
  metric_value NUMERIC NOT NULL,
  unit TEXT, -- 'percentage', 'count', 'days', 'score'
  calculation_date DATE DEFAULT CURRENT_DATE,
  department TEXT,
  location TEXT,
  category TEXT, -- 'policy_compliance', 'audit_performance', 'incident_rate', 'risk_level'
  target_value NUMERIC,
  threshold_red NUMERIC,
  threshold_yellow NUMERIC,
  threshold_green NUMERIC,
  trend_direction TEXT, -- 'up', 'down', 'stable'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Auto-generate case numbers
CREATE SEQUENCE compliance_case_seq START 1000;
CREATE SEQUENCE compliance_incident_seq START 2000;

-- Triggers for auto-generating numbers
CREATE OR REPLACE FUNCTION generate_compliance_case_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.case_number IS NULL THEN
    NEW.case_number := 'CC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('compliance_case_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.incident_number IS NULL THEN
    NEW.incident_number := 'INC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('compliance_incident_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER compliance_case_number_trigger
    BEFORE INSERT ON public.compliance_cases
    FOR EACH ROW
    EXECUTE FUNCTION generate_compliance_case_number();

CREATE TRIGGER incident_number_trigger
    BEFORE INSERT ON public.compliance_incidents
    FOR EACH ROW
    EXECUTE FUNCTION generate_incident_number();

-- Updated at triggers
CREATE TRIGGER update_compliance_cases_updated_at
    BEFORE UPDATE ON public.compliance_cases
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_policies_updated_at
    BEFORE UPDATE ON public.compliance_policies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_audits_updated_at
    BEFORE UPDATE ON public.compliance_audits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audit_findings_updated_at
    BEFORE UPDATE ON public.audit_findings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_incidents_updated_at
    BEFORE UPDATE ON public.compliance_incidents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whistleblower_reports_updated_at
    BEFORE UPDATE ON public.whistleblower_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_deadlines_updated_at
    BEFORE UPDATE ON public.compliance_deadlines
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_risks_updated_at
    BEFORE UPDATE ON public.compliance_risks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.compliance_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whistleblower_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic policies - can be refined based on specific requirements)
CREATE POLICY "Users can view compliance cases" ON public.compliance_cases FOR SELECT USING (true);
CREATE POLICY "Users can create compliance cases" ON public.compliance_cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update compliance cases" ON public.compliance_cases FOR UPDATE USING (true);

CREATE POLICY "Users can view policies" ON public.compliance_policies FOR SELECT USING (true);
CREATE POLICY "Users can create policies" ON public.compliance_policies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update policies" ON public.compliance_policies FOR UPDATE USING (true);

CREATE POLICY "Users can view acknowledgments" ON public.policy_acknowledgments FOR SELECT USING (true);
CREATE POLICY "Users can create acknowledgments" ON public.policy_acknowledgments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view audits" ON public.compliance_audits FOR SELECT USING (true);
CREATE POLICY "Users can create audits" ON public.compliance_audits FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update audits" ON public.compliance_audits FOR UPDATE USING (true);

CREATE POLICY "Users can view findings" ON public.audit_findings FOR SELECT USING (true);
CREATE POLICY "Users can create findings" ON public.audit_findings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update findings" ON public.audit_findings FOR UPDATE USING (true);

CREATE POLICY "Users can view incidents" ON public.compliance_incidents FOR SELECT USING (true);
CREATE POLICY "Users can create incidents" ON public.compliance_incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update incidents" ON public.compliance_incidents FOR UPDATE USING (true);

-- Whistleblower reports need special handling for anonymity
CREATE POLICY "Anonymous whistleblower access" ON public.whistleblower_reports FOR SELECT USING (true);
CREATE POLICY "Create whistleblower reports" ON public.whistleblower_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Update whistleblower reports" ON public.whistleblower_reports FOR UPDATE USING (true);

CREATE POLICY "Users can view deadlines" ON public.compliance_deadlines FOR SELECT USING (true);
CREATE POLICY "Users can create deadlines" ON public.compliance_deadlines FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update deadlines" ON public.compliance_deadlines FOR UPDATE USING (true);

CREATE POLICY "Users can view risks" ON public.compliance_risks FOR SELECT USING (true);
CREATE POLICY "Users can create risks" ON public.compliance_risks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update risks" ON public.compliance_risks FOR UPDATE USING (true);

CREATE POLICY "Users can view reports" ON public.compliance_reports FOR SELECT USING (true);
CREATE POLICY "Users can create reports" ON public.compliance_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view metrics" ON public.compliance_metrics FOR SELECT USING (true);
CREATE POLICY "Users can create metrics" ON public.compliance_metrics FOR INSERT WITH CHECK (true);
