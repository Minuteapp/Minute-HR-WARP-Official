-- Performance AI Insights Table
CREATE TABLE public.performance_ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  priority text NOT NULL CHECK (priority IN ('high', 'medium', 'info')),
  insight_type text NOT NULL CHECK (insight_type IN ('warning', 'pattern', 'suggestion', 'summary')),
  title text NOT NULL,
  description text,
  recommendation text,
  affected_employees text[],
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Performance History Table
CREATE TABLE public.performance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('review_completed', 'goal_reached', 'action_completed')),
  title text NOT NULL,
  department text,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_name text,
  progress numeric,
  source text CHECK (source IN ('goals', 'tasks')),
  event_date date NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Performance Settings Table
CREATE TABLE public.performance_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_cycle text DEFAULT 'quarterly' CHECK (review_cycle IN ('monthly', 'quarterly', 'yearly')),
  mandatory_checkins boolean DEFAULT true,
  anonymous_feedback boolean DEFAULT false,
  ai_enabled boolean DEFAULT true,
  goals_integration boolean DEFAULT true,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for performance_ai_insights
CREATE POLICY "Users can view performance_ai_insights" ON public.performance_ai_insights
  FOR SELECT USING (true);

CREATE POLICY "Users can insert performance_ai_insights" ON public.performance_ai_insights
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update performance_ai_insights" ON public.performance_ai_insights
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete performance_ai_insights" ON public.performance_ai_insights
  FOR DELETE USING (true);

-- RLS Policies for performance_history
CREATE POLICY "Users can view performance_history" ON public.performance_history
  FOR SELECT USING (true);

CREATE POLICY "Users can insert performance_history" ON public.performance_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update performance_history" ON public.performance_history
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete performance_history" ON public.performance_history
  FOR DELETE USING (true);

-- RLS Policies for performance_settings
CREATE POLICY "Users can view performance_settings" ON public.performance_settings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert performance_settings" ON public.performance_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update performance_settings" ON public.performance_settings
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete performance_settings" ON public.performance_settings
  FOR DELETE USING (true);

-- Indexes
CREATE INDEX idx_performance_ai_insights_company ON public.performance_ai_insights(company_id);
CREATE INDEX idx_performance_ai_insights_priority ON public.performance_ai_insights(priority);
CREATE INDEX idx_performance_history_company ON public.performance_history(company_id);
CREATE INDEX idx_performance_history_event_date ON public.performance_history(event_date);
CREATE INDEX idx_performance_settings_company ON public.performance_settings(company_id);