-- Performance Management System Migration (Fixed)

-- Helper function to get user company ID
CREATE OR REPLACE FUNCTION get_user_company_id(user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT company_id FROM user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$;

-- Performance Cycles Table
CREATE TABLE IF NOT EXISTS public.performance_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cycle_type TEXT NOT NULL CHECK (cycle_type IN ('quarterly', 'annual', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  self_review_deadline DATE,
  peer_review_deadline DATE,
  manager_review_deadline DATE,
  calibration_deadline DATE,
  final_deadline DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'calibration', 'completed', 'archived')),
  is_active BOOLEAN DEFAULT true,
  company_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Templates Table
CREATE TABLE IF NOT EXISTS public.performance_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('classic', 'okr_based', 'sales_scorecard', 'support_scorecard', 'custom')),
  sections JSONB DEFAULT '[]'::jsonb,
  rating_scale TEXT DEFAULT '1-5' CHECK (rating_scale IN ('1-5', '1-10', 'percentage', 'qualitative')),
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  company_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Reviews Table (erweitert)
CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  reviewer_id UUID,
  template_id UUID REFERENCES public.performance_templates(id),
  cycle_id UUID REFERENCES public.performance_cycles(id),
  review_type TEXT NOT NULL CHECK (review_type IN ('self', 'peer', 'manager', 'calibration')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'submitted', 'completed', 'approved')),
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  due_date DATE,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  overall_rating NUMERIC,
  goals_achievement JSONB DEFAULT '{}'::jsonb,
  competencies_rating JSONB DEFAULT '{}'::jsonb,
  values_rating JSONB DEFAULT '{}'::jsonb,
  potential_rating TEXT CHECK (potential_rating IN ('low', 'medium', 'high', 'exceptional')),
  promotion_recommendation BOOLEAN DEFAULT false,
  compensation_recommendation TEXT CHECK (compensation_recommendation IN ('decrease', 'maintain', 'increase_small', 'increase_medium', 'increase_large')),
  development_priorities JSONB DEFAULT '[]'::jsonb,
  strengths TEXT,
  areas_for_improvement TEXT,
  manager_comments TEXT,
  employee_comments TEXT,
  hr_comments TEXT,
  evidence_links JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Peer Review Nominations
CREATE TABLE IF NOT EXISTS public.peer_review_nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.performance_reviews(id) ON DELETE CASCADE,
  nominated_by UUID NOT NULL,
  peer_reviewer_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  justification TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(review_id, peer_reviewer_id)
);

-- Continuous Feedback
CREATE TABLE IF NOT EXISTS public.performance_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('kudos', 'constructive', '1on1_note', 'pulse_response')),
  subject TEXT,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  is_shared_with_manager BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  related_project_id UUID,
  related_goal_id UUID,
  visibility TEXT DEFAULT 'manager' CHECK (visibility IN ('private', 'manager', 'hr', 'public')),
  metadata JSONB DEFAULT '{}'::jsonb,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pulse Survey Questions
CREATE TABLE IF NOT EXISTS public.pulse_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES public.performance_cycles(id),
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'rating' CHECK (question_type IN ('rating', 'multiple_choice', 'text', 'yes_no')),
  options JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN DEFAULT true,
  phase TEXT CHECK (phase IN ('self_review', 'peer_review', 'manager_review', 'calibration')),
  sort_order INTEGER DEFAULT 0,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pulse Survey Responses
CREATE TABLE IF NOT EXISTS public.pulse_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.pulse_questions(id),
  respondent_id UUID NOT NULL,
  response_value TEXT,
  response_text TEXT,
  cycle_id UUID REFERENCES public.performance_cycles(id),
  anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9-Box Calibration
CREATE TABLE IF NOT EXISTS public.calibration_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES public.performance_cycles(id),
  employee_id UUID NOT NULL,
  performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 3),
  potential_rating INTEGER CHECK (potential_rating BETWEEN 1 AND 3),
  calibrated_by UUID NOT NULL,
  calibration_notes TEXT,
  position_justification TEXT,
  succession_readiness TEXT CHECK (succession_readiness IN ('ready_now', 'ready_1_year', 'ready_2_years', 'not_ready')),
  flight_risk_level TEXT CHECK (flight_risk_level IN ('low', 'medium', 'high')),
  calibration_session_id UUID,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cycle_id, employee_id)
);

-- Development Plans (IDPs)
CREATE TABLE IF NOT EXISTS public.development_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'on_hold', 'archived')),
  start_date DATE NOT NULL,
  target_completion_date DATE,
  actual_completion_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  competency_gaps JSONB DEFAULT '[]'::jsonb,
  development_goals JSONB DEFAULT '[]'::jsonb,
  learning_activities JSONB DEFAULT '[]'::jsonb,
  mentoring_assignments JSONB DEFAULT '[]'::jsonb,
  stretch_assignments JSONB DEFAULT '[]'::jsonb,
  success_metrics JSONB DEFAULT '[]'::jsonb,
  manager_support_needed TEXT,
  budget_allocated NUMERIC DEFAULT 0,
  budget_spent NUMERIC DEFAULT 0,
  review_schedule TEXT CHECK (review_schedule IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
  next_review_date DATE,
  manager_id UUID,
  hr_business_partner_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Succession Planning
CREATE TABLE IF NOT EXISTS public.succession_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_position_id UUID NOT NULL,
  position_title TEXT NOT NULL,
  department TEXT NOT NULL,
  incumbent_id UUID,
  business_criticality TEXT CHECK (business_criticality IN ('low', 'medium', 'high', 'critical')),
  succession_risk TEXT CHECK (succession_risk IN ('low', 'medium', 'high')),
  required_competencies JSONB DEFAULT '[]'::jsonb,
  succession_candidates JSONB DEFAULT '[]'::jsonb,
  development_pipeline JSONB DEFAULT '[]'::jsonb,
  emergency_plan TEXT,
  knowledge_transfer_plan TEXT,
  review_frequency TEXT CHECK (review_frequency IN ('quarterly', 'biannual', 'annual')),
  next_review_date DATE,
  owner_id UUID NOT NULL,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Notifications
CREATE TABLE IF NOT EXISTS public.performance_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'review_due', 'review_submitted', 'review_completed', 'feedback_received', 
    'calibration_scheduled', 'development_plan_due', 'pulse_survey_available'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Audit Trail
CREATE TABLE IF NOT EXISTS public.performance_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  change_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.performance_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibration_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.succession_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Performance Cycles
CREATE POLICY "performance_cycles_select" ON public.performance_cycles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "performance_cycles_insert" ON public.performance_cycles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
  );

CREATE POLICY "performance_cycles_update" ON public.performance_cycles
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
  );

-- Performance Templates
CREATE POLICY "performance_templates_select" ON public.performance_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "performance_templates_insert" ON public.performance_templates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "performance_templates_update" ON public.performance_templates
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
  );

-- Performance Reviews
CREATE POLICY "performance_reviews_select" ON public.performance_reviews
  FOR SELECT USING (
    employee_id = auth.uid() OR 
    reviewer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'manager', 'superadmin'))
  );

CREATE POLICY "performance_reviews_insert" ON public.performance_reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    (reviewer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'manager', 'superadmin')
    ))
  );

CREATE POLICY "performance_reviews_update" ON public.performance_reviews
  FOR UPDATE USING (
    (employee_id = auth.uid() AND review_type = 'self') OR
    reviewer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'manager', 'superadmin'))
  );

-- Feedback
CREATE POLICY "performance_feedback_select" ON public.performance_feedback
  FOR SELECT USING (
    from_user_id = auth.uid() OR 
    to_user_id = auth.uid() OR
    (visibility IN ('manager', 'hr', 'public') AND auth.uid() IS NOT NULL) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'manager', 'superadmin'))
  );

CREATE POLICY "performance_feedback_insert" ON public.performance_feedback
  FOR INSERT WITH CHECK (from_user_id = auth.uid());

-- Development Plans
CREATE POLICY "development_plans_select" ON public.development_plans
  FOR SELECT USING (
    employee_id = auth.uid() OR 
    manager_id = auth.uid() OR
    hr_business_partner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
  );

CREATE POLICY "development_plans_insert" ON public.development_plans
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    (manager_id = auth.uid() OR hr_business_partner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'manager', 'superadmin')
    ))
  );

CREATE POLICY "development_plans_update" ON public.development_plans
  FOR UPDATE USING (
    employee_id = auth.uid() OR 
    manager_id = auth.uid() OR
    hr_business_partner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
  );

-- Succession Plans (restricted to HR and Admin only)
CREATE POLICY "succession_plans_select" ON public.succession_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
  );

CREATE POLICY "succession_plans_insert" ON public.succession_plans
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
  );

CREATE POLICY "succession_plans_update" ON public.succession_plans
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
  );

-- Notifications
CREATE POLICY "performance_notifications_select" ON public.performance_notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "performance_notifications_update" ON public.performance_notifications
  FOR UPDATE USING (recipient_id = auth.uid());

-- Audit Trail (read-only for most users)
CREATE POLICY "performance_audit_trail_select" ON public.performance_audit_trail
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
  );

CREATE POLICY "performance_audit_trail_insert" ON public.performance_audit_trail
  FOR INSERT WITH CHECK (performed_by = auth.uid());