-- Create enum for survey types
CREATE TYPE public.pulse_survey_type AS ENUM (
  'mood_pulse',
  'quarterly_engagement',
  'leadership_check',
  'wellbeing',
  'onboarding',
  'exit'
);

-- Create enum for survey status
CREATE TYPE public.pulse_survey_status AS ENUM (
  'draft',
  'active',
  'closed',
  'archived'
);

-- Create enum for question types
CREATE TYPE public.pulse_question_type AS ENUM (
  'multiple_choice',
  'scale',
  'yes_no',
  'free_text',
  'nps'
);

-- Create enum for sentiment
CREATE TYPE public.pulse_sentiment AS ENUM (
  'positive',
  'neutral',
  'negative',
  'critical'
);

-- Create enum for recurrence pattern
CREATE TYPE public.pulse_recurrence AS ENUM (
  'weekly',
  'monthly',
  'quarterly'
);

-- Table: pulse_surveys
CREATE TABLE public.pulse_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  survey_type pulse_survey_type NOT NULL,
  status pulse_survey_status DEFAULT 'draft',
  target_audience JSONB DEFAULT '{}',
  questions JSONB DEFAULT '[]',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_anonymous BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern pulse_recurrence,
  min_participants_for_stats INTEGER DEFAULT 5,
  language TEXT DEFAULT 'de',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: pulse_survey_responses
CREATE TABLE public.pulse_survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  survey_id UUID REFERENCES public.pulse_surveys(id) ON DELETE CASCADE,
  respondent_id UUID,
  response_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  sentiment_score NUMERIC,
  completed_at TIMESTAMPTZ DEFAULT now(),
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: pulse_survey_questions
CREATE TABLE public.pulse_survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  question_type pulse_question_type NOT NULL,
  category TEXT,
  options JSONB,
  scale_min INTEGER,
  scale_max INTEGER,
  is_required BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'de',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: pulse_survey_analytics
CREATE TABLE public.pulse_survey_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  survey_id UUID REFERENCES public.pulse_surveys(id) ON DELETE CASCADE,
  period DATE,
  department TEXT,
  location TEXT,
  engagement_score NUMERIC,
  participation_rate NUMERIC,
  sentiment_trend pulse_sentiment,
  psychological_burden_index NUMERIC,
  turnover_risk_score NUMERIC,
  satisfaction_scores JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: pulse_ai_insights
CREATE TABLE public.pulse_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  survey_id UUID REFERENCES public.pulse_surveys(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  affected_groups JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  confidence_score NUMERIC,
  data_points JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: pulse_action_items
CREATE TABLE public.pulse_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  survey_id UUID REFERENCES public.pulse_surveys(id) ON DELETE CASCADE,
  insight_id UUID REFERENCES public.pulse_ai_insights(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  action_type TEXT,
  target_department TEXT,
  assigned_to UUID,
  status TEXT DEFAULT 'open',
  due_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Table: pulse_survey_templates
CREATE TABLE public.pulse_survey_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  template_type pulse_survey_type NOT NULL,
  questions JSONB DEFAULT '[]',
  is_system_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_pulse_surveys_tenant ON pulse_surveys(tenant_id);
CREATE INDEX idx_pulse_surveys_status ON pulse_surveys(status);
CREATE INDEX idx_pulse_survey_responses_survey ON pulse_survey_responses(survey_id);
CREATE INDEX idx_pulse_survey_responses_tenant ON pulse_survey_responses(tenant_id);
CREATE INDEX idx_pulse_analytics_survey ON pulse_survey_analytics(survey_id);
CREATE INDEX idx_pulse_analytics_period ON pulse_survey_analytics(period);
CREATE INDEX idx_pulse_ai_insights_survey ON pulse_ai_insights(survey_id);
CREATE INDEX idx_pulse_action_items_survey ON pulse_action_items(survey_id);

-- Enable RLS
ALTER TABLE pulse_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_survey_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_survey_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pulse_surveys
CREATE POLICY "Users can view surveys from their tenant"
  ON pulse_surveys FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "HR can manage surveys"
  ON pulse_surveys FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('hr', 'admin', 'superadmin')
    )
  );

-- RLS Policies for pulse_survey_responses
CREATE POLICY "Users can view own responses"
  ON pulse_survey_responses FOR SELECT
  USING (
    respondent_id = auth.uid() OR is_anonymous = true
  );

CREATE POLICY "Users can create responses"
  ON pulse_survey_responses FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "HR can view all responses"
  ON pulse_survey_responses FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('hr', 'admin', 'superadmin')
    )
  );

-- RLS Policies for pulse_survey_analytics
CREATE POLICY "Users can view analytics from their tenant"
  ON pulse_survey_analytics FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for pulse_ai_insights
CREATE POLICY "Users can view insights from their tenant"
  ON pulse_ai_insights FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for pulse_action_items
CREATE POLICY "Users can view action items from their tenant"
  ON pulse_action_items FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "HR can manage action items"
  ON pulse_action_items FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('hr', 'admin', 'superadmin')
    )
  );

-- RLS Policies for pulse_survey_templates
CREATE POLICY "Users can view templates"
  ON pulse_survey_templates FOR SELECT
  USING (
    is_system_template = true OR
    tenant_id IN (
      SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "HR can manage templates"
  ON pulse_survey_templates FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('hr', 'admin', 'superadmin')
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pulse_surveys_updated_at
  BEFORE UPDATE ON pulse_surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pulse_survey_questions_updated_at
  BEFORE UPDATE ON pulse_survey_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pulse_action_items_updated_at
  BEFORE UPDATE ON pulse_action_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pulse_survey_templates_updated_at
  BEFORE UPDATE ON pulse_survey_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();