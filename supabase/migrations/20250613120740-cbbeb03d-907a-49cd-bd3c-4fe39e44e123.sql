
-- Performance Templates Tabelle
CREATE TABLE IF NOT EXISTS public.performance_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('individual', 'team', 'goal_based', 'feedback_360', 'ad_hoc')),
  evaluation_fields JSONB NOT NULL DEFAULT '[]',
  criteria JSONB NOT NULL DEFAULT '[]',
  rating_scale TEXT NOT NULL DEFAULT 'stars_5' CHECK (rating_scale IN ('stars_5', 'percentage', 'grade', 'text')),
  cycle_type TEXT NOT NULL DEFAULT 'quarterly' CHECK (cycle_type IN ('monthly', 'quarterly', 'semi_annual', 'annual')),
  requires_signature BOOLEAN DEFAULT false,
  is_system_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance Reviews Tabelle
CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.performance_templates(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team_id UUID,
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'pending_signature', 'completed', 'archived')),
  overall_score NUMERIC(3,2),
  scores JSONB DEFAULT '{}',
  feedback JSONB DEFAULT '{}',
  improvement_goals TEXT,
  action_items JSONB DEFAULT '[]',
  reviewer_signature JSONB,
  employee_signature JSONB,
  signed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance Criteria Tabelle (für flexible Bewertungskriterien)
CREATE TABLE IF NOT EXISTS public.performance_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.performance_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  weight NUMERIC(3,2) DEFAULT 1.0,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance Comments Tabelle
CREATE TABLE IF NOT EXISTS public.performance_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.performance_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  criteria_id UUID REFERENCES public.performance_criteria(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  parent_comment_id UUID REFERENCES public.performance_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance Notifications Tabelle
CREATE TABLE IF NOT EXISTS public.performance_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.performance_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('review_due', 'feedback_request', 'review_completed', 'signature_required')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Performance Cycles Tabelle (für wiederkehrende Review-Zyklen)
CREATE TABLE IF NOT EXISTS public.performance_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cycle_type TEXT NOT NULL CHECK (cycle_type IN ('monthly', 'quarterly', 'semi_annual', 'annual')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  template_id UUID REFERENCES public.performance_templates(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  auto_create_reviews BOOLEAN DEFAULT false,
  reminder_days_before INTEGER DEFAULT 7,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance Analytics Tabelle (für KI-Analyse)
CREATE TABLE IF NOT EXISTS public.performance_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  analysis_period_start DATE NOT NULL,
  analysis_period_end DATE NOT NULL,
  performance_trend TEXT CHECK (performance_trend IN ('improving', 'declining', 'stable')),
  trend_score NUMERIC(3,2),
  peer_comparison JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  risk_factors JSONB DEFAULT '[]',
  strengths JSONB DEFAULT '[]',
  areas_for_improvement JSONB DEFAULT '[]',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_current BOOLEAN DEFAULT true
);

-- Performance Goal Links Tabelle (Verknüpfung mit Ziel-Modul)
CREATE TABLE IF NOT EXISTS public.performance_goal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.performance_reviews(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  goal_weight NUMERIC(3,2) DEFAULT 1.0,
  goal_achievement_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies für Performance Templates
ALTER TABLE public.performance_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benutzer können Templates anzeigen" ON public.performance_templates
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Admins können Templates verwalten" ON public.performance_templates
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies für Performance Reviews
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;

-- Korrigierte RLS Policy ohne user_id-Spalte in employees
CREATE POLICY "Mitarbeiter können eigene Reviews einsehen" ON public.performance_reviews
FOR SELECT TO authenticated 
USING (
  employee_id = auth.uid() OR
  reviewer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Reviewer können Reviews erstellen und bearbeiten" ON public.performance_reviews
FOR ALL TO authenticated 
USING (
  reviewer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies für Performance Criteria
ALTER TABLE public.performance_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benutzer können Kriterien anzeigen" ON public.performance_criteria
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Admins können Kriterien verwalten" ON public.performance_criteria
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies für Performance Comments
ALTER TABLE public.performance_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benutzer können Kommentare zu ihren Reviews einsehen" ON public.performance_comments
FOR SELECT TO authenticated 
USING (
  user_id = auth.uid() OR
  review_id IN (
    SELECT id FROM public.performance_reviews 
    WHERE employee_id = auth.uid() OR reviewer_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Benutzer können Kommentare erstellen" ON public.performance_comments
FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

-- RLS Policies für andere Tabellen
ALTER TABLE public.performance_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_goal_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benutzer können eigene Benachrichtigungen einsehen" ON public.performance_notifications
FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins können Zyklen verwalten" ON public.performance_cycles
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Korrigierte RLS Policy für Analytics
CREATE POLICY "Benutzer können Analytics einsehen" ON public.performance_analytics
FOR SELECT TO authenticated 
USING (
  employee_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Benutzer können Goal Links einsehen" ON public.performance_goal_links
FOR SELECT TO authenticated 
USING (
  review_id IN (
    SELECT id FROM public.performance_reviews 
    WHERE employee_id = auth.uid() OR reviewer_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_performance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_performance_templates_updated_at
  BEFORE UPDATE ON public.performance_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_performance_updated_at();

CREATE TRIGGER update_performance_reviews_updated_at
  BEFORE UPDATE ON public.performance_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_performance_updated_at();

CREATE TRIGGER update_performance_comments_updated_at
  BEFORE UPDATE ON public.performance_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_performance_updated_at();

-- Beispiel-Templates einfügen
INSERT INTO public.performance_templates (name, description, template_type, evaluation_fields, criteria, is_system_template) VALUES
('Standard Mitarbeiterbewertung', 'Standardvorlage für jährliche Mitarbeiterbewertungen', 'individual', 
 '[{"name":"fachwissen","label":"Fachwissen","type":"rating","required":true},{"name":"teamfaehigkeit","label":"Teamfähigkeit","type":"rating","required":true},{"name":"kommunikation","label":"Kommunikation","type":"rating","required":true}]',
 '[{"name":"fachwissen","weight":0.4,"category":"core"},{"name":"teamfaehigkeit","weight":0.3,"category":"soft_skills"},{"name":"kommunikation","weight":0.3,"category":"soft_skills"}]',
 true),
('Team Performance Review', 'Vorlage für Teambewertungen', 'team',
 '[{"name":"projektergebnis","label":"Projektergebnis","type":"rating","required":true},{"name":"zusammenarbeit","label":"Zusammenarbeit","type":"rating","required":true},{"name":"innovation","label":"Innovation","type":"rating","required":false}]',
 '[{"name":"projektergebnis","weight":0.5,"category":"results"},{"name":"zusammenarbeit","weight":0.3,"category":"collaboration"},{"name":"innovation","weight":0.2,"category":"innovation"}]',
 true),
('360° Feedback', 'Vorlage für 360-Grad-Feedback', 'feedback_360',
 '[{"name":"fuehrungsqualitaet","label":"Führungsqualität","type":"rating","required":true},{"name":"mentor_faehigkeit","label":"Mentoring","type":"rating","required":false},{"name":"strategisches_denken","label":"Strategisches Denken","type":"rating","required":true}]',
 '[{"name":"fuehrungsqualitaet","weight":0.4,"category":"leadership"},{"name":"mentor_faehigkeit","weight":0.3,"category":"development"},{"name":"strategisches_denken","weight":0.3,"category":"strategy"}]',
 true);
