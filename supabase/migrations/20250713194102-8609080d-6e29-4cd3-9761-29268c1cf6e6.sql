-- Performance Management Tables

-- Performance Templates
CREATE TABLE IF NOT EXISTS public.performance_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL DEFAULT 'individual' CHECK (template_type IN ('individual', 'team', 'goal_based', 'feedback_360', 'ad_hoc')),
  evaluation_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  rating_scale TEXT NOT NULL DEFAULT 'stars_5' CHECK (rating_scale IN ('stars_5', 'percentage', 'grade', 'text')),
  cycle_type TEXT NOT NULL DEFAULT 'quarterly' CHECK (cycle_type IN ('monthly', 'quarterly', 'semi_annual', 'annual')),
  requires_signature BOOLEAN NOT NULL DEFAULT false,
  is_system_template BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance Reviews
CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.performance_templates(id),
  employee_id UUID NOT NULL,
  reviewer_id UUID,
  team_id UUID,
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'pending_signature', 'completed', 'archived')),
  overall_score NUMERIC,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
  improvement_goals TEXT,
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  reviewer_signature JSONB,
  employee_signature JSONB,
  signed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance Comments
CREATE TABLE IF NOT EXISTS public.performance_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.performance_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  criteria_id TEXT,
  comment TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT false,
  parent_comment_id UUID REFERENCES public.performance_comments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance Notifications
CREATE TABLE IF NOT EXISTS public.performance_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.performance_reviews(id),
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('review_due', 'feedback_request', 'review_completed', 'signature_required')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Performance Cycles
CREATE TABLE IF NOT EXISTS public.performance_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cycle_type TEXT NOT NULL CHECK (cycle_type IN ('monthly', 'quarterly', 'semi_annual', 'annual')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  template_id UUID REFERENCES public.performance_templates(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_create_reviews BOOLEAN NOT NULL DEFAULT false,
  reminder_days_before INTEGER NOT NULL DEFAULT 7,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance Analytics
CREATE TABLE IF NOT EXISTS public.performance_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  analysis_period_start DATE NOT NULL,
  analysis_period_end DATE NOT NULL,
  performance_trend TEXT CHECK (performance_trend IN ('improving', 'declining', 'stable')),
  trend_score NUMERIC,
  peer_comparison JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  risk_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  areas_for_improvement JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_current BOOLEAN NOT NULL DEFAULT true
);

-- Performance Goal Links
CREATE TABLE IF NOT EXISTS public.performance_goal_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.performance_reviews(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL,
  goal_weight NUMERIC NOT NULL DEFAULT 1.0,
  goal_achievement_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.performance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_goal_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Performance Templates
CREATE POLICY "Templates are viewable by all authenticated users" 
ON public.performance_templates FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage templates" 
ON public.performance_templates FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'hr')
  )
);

-- RLS Policies for Performance Reviews
CREATE POLICY "Users can view their own reviews and reviews they conduct" 
ON public.performance_reviews FOR SELECT 
USING (
  auth.uid() = employee_id OR 
  auth.uid() = reviewer_id OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'hr')
  )
);

CREATE POLICY "Users can create reviews for their reports or admins can create any" 
ON public.performance_reviews FOR INSERT 
WITH CHECK (
  auth.uid() = reviewer_id OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'hr')
  )
);

CREATE POLICY "Users can update reviews they're involved in" 
ON public.performance_reviews FOR UPDATE 
USING (
  auth.uid() = employee_id OR 
  auth.uid() = reviewer_id OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'hr')
  )
);

-- RLS Policies for Performance Comments
CREATE POLICY "Users can view comments on reviews they're involved in" 
ON public.performance_comments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.performance_reviews 
    WHERE id = review_id 
    AND (employee_id = auth.uid() OR reviewer_id = auth.uid())
  ) OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'hr')
  )
);

CREATE POLICY "Users can create comments on reviews they're involved in" 
ON public.performance_comments FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.performance_reviews 
    WHERE id = review_id 
    AND (employee_id = auth.uid() OR reviewer_id = auth.uid())
  )
);

-- RLS Policies for Performance Notifications
CREATE POLICY "Users can view their own notifications" 
ON public.performance_notifications FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" 
ON public.performance_notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.performance_notifications FOR UPDATE 
USING (user_id = auth.uid());

-- RLS Policies for Performance Cycles
CREATE POLICY "All authenticated users can view active cycles" 
ON public.performance_cycles FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage cycles" 
ON public.performance_cycles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'hr')
  )
);

-- RLS Policies for Performance Analytics
CREATE POLICY "Users can view their own analytics and admins can view all" 
ON public.performance_analytics FOR SELECT 
USING (
  employee_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'hr')
  )
);

CREATE POLICY "System can create analytics" 
ON public.performance_analytics FOR INSERT 
WITH CHECK (true);

-- RLS Policies for Performance Goal Links
CREATE POLICY "Users can view goal links for reviews they're involved in" 
ON public.performance_goal_links FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.performance_reviews 
    WHERE id = review_id 
    AND (employee_id = auth.uid() OR reviewer_id = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'hr')
  )
);

CREATE POLICY "Reviewers and admins can manage goal links" 
ON public.performance_goal_links FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.performance_reviews 
    WHERE id = review_id 
    AND reviewer_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'hr')
  )
);

-- Create update triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_performance_templates_updated_at
    BEFORE UPDATE ON public.performance_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at
    BEFORE UPDATE ON public.performance_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_comments_updated_at
    BEFORE UPDATE ON public.performance_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default templates
INSERT INTO public.performance_templates (name, description, template_type, criteria, is_system_template) VALUES
('Standard Mitarbeiterbewertung', 'Standardtemplate für jährliche Mitarbeiterbewertungen', 'individual', 
 '[
   {"name": "Arbeitsqualität", "weight": 1.5, "category": "Leistung"},
   {"name": "Teamwork", "weight": 1.2, "category": "Zusammenarbeit"},
   {"name": "Kommunikation", "weight": 1.0, "category": "Soft Skills"},
   {"name": "Zielerreichung", "weight": 1.8, "category": "Ergebnisse"},
   {"name": "Initiative", "weight": 1.1, "category": "Verhalten"}
 ]'::jsonb, true),

('360° Feedback Template', 'Umfassendes 360-Grad-Feedback für Führungskräfte', 'feedback_360',
 '[
   {"name": "Führungsqualitäten", "weight": 2.0, "category": "Leadership"},
   {"name": "Strategisches Denken", "weight": 1.5, "category": "Strategie"},
   {"name": "Mitarbeiterentwicklung", "weight": 1.7, "category": "Development"},
   {"name": "Entscheidungsfindung", "weight": 1.3, "category": "Management"},
   {"name": "Visionäre Führung", "weight": 1.4, "category": "Vision"}
 ]'::jsonb, true),

('Quartalsweise Zielbewertung', 'Template für quartalsweise zielbasierte Reviews', 'goal_based',
 '[
   {"name": "Zielerreichung Q1", "weight": 1.0, "category": "Quartalsziele"},
   {"name": "Zielerreichung Q2", "weight": 1.0, "category": "Quartalsziele"},
   {"name": "Zielerreichung Q3", "weight": 1.0, "category": "Quartalsziele"},
   {"name": "Zielerreichung Q4", "weight": 1.0, "category": "Quartalsziele"},
   {"name": "Jahreszielerreichung", "weight": 2.0, "category": "Jahresziele"}
 ]'::jsonb, true)
ON CONFLICT DO NOTHING;