-- Performance Management Tables (without triggers)

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

-- Enable RLS and create basic policies
ALTER TABLE public.performance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "performance_templates_select" ON public.performance_templates FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);
CREATE POLICY "performance_reviews_select" ON public.performance_reviews FOR SELECT USING (auth.uid() = employee_id OR auth.uid() = reviewer_id);

-- Insert default templates
INSERT INTO public.performance_templates (name, description, template_type, criteria, is_system_template) VALUES
('Standard Mitarbeiterbewertung', 'Standardtemplate für jährliche Mitarbeiterbewertungen', 'individual', 
 '[{"name": "Arbeitsqualität", "weight": 1.5, "category": "Leistung"}]'::jsonb, true)
ON CONFLICT DO NOTHING;