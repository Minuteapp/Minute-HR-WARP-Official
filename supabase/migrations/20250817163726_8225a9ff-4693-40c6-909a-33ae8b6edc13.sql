-- Ziele-Modul: Vollständige Datenstrukturen für OKR & KPIs

-- 1. Cycles (Zeiträume für OKRs)
CREATE TABLE IF NOT EXISTS public.goal_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cycle_type TEXT NOT NULL DEFAULT 'quarterly', -- quarterly, yearly, custom
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, archived
  company_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Key Results Tabelle erweitern
CREATE TABLE IF NOT EXISTS public.goal_key_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'number', -- number, percent, currency, boolean
  baseline_value NUMERIC DEFAULT 0,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  progress_method TEXT NOT NULL DEFAULT 'manual', -- manual, formula, source
  source_module TEXT, -- Projects, Helpdesk, ESG, Sales, etc.
  source_metric TEXT,
  formula TEXT,
  weight NUMERIC DEFAULT 1.0,
  status TEXT NOT NULL DEFAULT 'active',
  confidence_level NUMERIC DEFAULT 0.5, -- 0-1
  is_at_risk BOOLEAN DEFAULT false,
  company_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Goal Check-ins
CREATE TABLE IF NOT EXISTS public.goal_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL,
  key_result_id UUID,
  progress_value NUMERIC,
  confidence_level NUMERIC DEFAULT 0.5, -- 0-1
  status_update TEXT NOT NULL DEFAULT 'on_track', -- on_track, at_risk, off_track
  comment TEXT,
  next_steps TEXT,
  blockers TEXT,
  achievements TEXT,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  submitted_by UUID,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Goal Links (Verbindungen zu anderen Modulen)
CREATE TABLE IF NOT EXISTS public.goal_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL,
  key_result_id UUID,
  source_module TEXT NOT NULL, -- Projects, Tasks, Helpdesk, ESG, etc.
  source_id TEXT NOT NULL,
  source_type TEXT NOT NULL, -- project, task, ticket, initiative, etc.
  link_type TEXT NOT NULL DEFAULT 'contributes_to', -- contributes_to, depends_on, blocks
  weight NUMERIC DEFAULT 1.0,
  auto_update BOOLEAN DEFAULT true,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Erweiterte Goals Tabelle aktualisieren
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS cycle_id UUID;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS goal_level TEXT DEFAULT 'individual'; -- individual, team, company
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS alignment_parent_id UUID;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS weight NUMERIC DEFAULT 1.0;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS confidence_level NUMERIC DEFAULT 0.5;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS is_at_risk BOOLEAN DEFAULT false;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS last_checkin_date DATE;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending'; -- pending, in_review, approved, rejected
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS company_id UUID;

-- 6. Goal Reviews
CREATE TABLE IF NOT EXISTS public.goal_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL,
  review_type TEXT NOT NULL DEFAULT 'mid_cycle', -- mid_cycle, end_cycle, quarterly
  review_period TEXT NOT NULL,
  overall_score NUMERIC,
  achievement_score NUMERIC,
  quality_score NUMERIC,
  reviewer_feedback TEXT,
  self_assessment TEXT,
  lessons_learned TEXT,
  next_period_focus TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, submitted, reviewed, approved
  reviewed_by UUID,
  submitted_by UUID,
  review_date DATE,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. RLS Policies
ALTER TABLE public.goal_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_reviews ENABLE ROW LEVEL SECURITY;

-- Goals Cycles Policies
CREATE POLICY "goal_cycles_select" ON public.goal_cycles FOR SELECT USING (
  company_id = get_user_company_id(auth.uid()) OR 
  is_superadmin_safe(auth.uid()) OR
  company_id IS NULL
);

CREATE POLICY "goal_cycles_insert" ON public.goal_cycles FOR INSERT WITH CHECK (
  (company_id = get_user_company_id(auth.uid()) AND 
   EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'manager'))) OR
  is_superadmin_safe(auth.uid())
);

CREATE POLICY "goal_cycles_update" ON public.goal_cycles FOR UPDATE USING (
  (company_id = get_user_company_id(auth.uid()) AND 
   EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'manager'))) OR
  is_superadmin_safe(auth.uid())
);

-- Key Results Policies
CREATE POLICY "goal_key_results_select" ON public.goal_key_results FOR SELECT USING (
  company_id = get_user_company_id(auth.uid()) OR 
  is_superadmin_safe(auth.uid()) OR
  company_id IS NULL
);

CREATE POLICY "goal_key_results_insert" ON public.goal_key_results FOR INSERT WITH CHECK (
  company_id = get_user_company_id(auth.uid()) OR is_superadmin_safe(auth.uid())
);

CREATE POLICY "goal_key_results_update" ON public.goal_key_results FOR UPDATE USING (
  company_id = get_user_company_id(auth.uid()) OR is_superadmin_safe(auth.uid())
);

-- Check-ins Policies
CREATE POLICY "goal_checkins_select" ON public.goal_checkins FOR SELECT USING (
  company_id = get_user_company_id(auth.uid()) OR 
  is_superadmin_safe(auth.uid()) OR
  company_id IS NULL
);

CREATE POLICY "goal_checkins_insert" ON public.goal_checkins FOR INSERT WITH CHECK (
  company_id = get_user_company_id(auth.uid()) OR is_superadmin_safe(auth.uid())
);

CREATE POLICY "goal_checkins_update" ON public.goal_checkins FOR UPDATE USING (
  company_id = get_user_company_id(auth.uid()) OR is_superadmin_safe(auth.uid())
);

-- Links Policies
CREATE POLICY "goal_links_select" ON public.goal_links FOR SELECT USING (
  company_id = get_user_company_id(auth.uid()) OR 
  is_superadmin_safe(auth.uid()) OR
  company_id IS NULL
);

CREATE POLICY "goal_links_insert" ON public.goal_links FOR INSERT WITH CHECK (
  company_id = get_user_company_id(auth.uid()) OR is_superadmin_safe(auth.uid())
);

CREATE POLICY "goal_links_update" ON public.goal_links FOR UPDATE USING (
  company_id = get_user_company_id(auth.uid()) OR is_superadmin_safe(auth.uid())
);

-- Reviews Policies
CREATE POLICY "goal_reviews_select" ON public.goal_reviews FOR SELECT USING (
  company_id = get_user_company_id(auth.uid()) OR 
  is_superadmin_safe(auth.uid()) OR
  company_id IS NULL
);

CREATE POLICY "goal_reviews_insert" ON public.goal_reviews FOR INSERT WITH CHECK (
  company_id = get_user_company_id(auth.uid()) OR is_superadmin_safe(auth.uid())
);

CREATE POLICY "goal_reviews_update" ON public.goal_reviews FOR UPDATE USING (
  company_id = get_user_company_id(auth.uid()) OR is_superadmin_safe(auth.uid())
);

-- 8. Trigger für updated_at
CREATE OR REPLACE FUNCTION update_goal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_goal_cycles_updated_at
  BEFORE UPDATE ON public.goal_cycles
  FOR EACH ROW EXECUTE FUNCTION update_goal_updated_at();

CREATE TRIGGER update_goal_key_results_updated_at
  BEFORE UPDATE ON public.goal_key_results
  FOR EACH ROW EXECUTE FUNCTION update_goal_updated_at();

CREATE TRIGGER update_goal_checkins_updated_at
  BEFORE UPDATE ON public.goal_checkins
  FOR EACH ROW EXECUTE FUNCTION update_goal_updated_at();

CREATE TRIGGER update_goal_links_updated_at
  BEFORE UPDATE ON public.goal_links
  FOR EACH ROW EXECUTE FUNCTION update_goal_links_updated_at();

CREATE TRIGGER update_goal_reviews_updated_at
  BEFORE UPDATE ON public.goal_reviews
  FOR EACH ROW EXECUTE FUNCTION update_goal_updated_at();

-- 9. Foreign Key Constraints
ALTER TABLE public.goal_key_results 
ADD CONSTRAINT fk_goal_key_results_goal_id 
FOREIGN KEY (goal_id) REFERENCES public.goals(id) ON DELETE CASCADE;

ALTER TABLE public.goal_checkins 
ADD CONSTRAINT fk_goal_checkins_goal_id 
FOREIGN KEY (goal_id) REFERENCES public.goals(id) ON DELETE CASCADE;

ALTER TABLE public.goal_checkins 
ADD CONSTRAINT fk_goal_checkins_key_result_id 
FOREIGN KEY (key_result_id) REFERENCES public.goal_key_results(id) ON DELETE CASCADE;

ALTER TABLE public.goal_links 
ADD CONSTRAINT fk_goal_links_goal_id 
FOREIGN KEY (goal_id) REFERENCES public.goals(id) ON DELETE CASCADE;

ALTER TABLE public.goal_links 
ADD CONSTRAINT fk_goal_links_key_result_id 
FOREIGN KEY (key_result_id) REFERENCES public.goal_key_results(id) ON DELETE CASCADE;

ALTER TABLE public.goal_reviews 
ADD CONSTRAINT fk_goal_reviews_goal_id 
FOREIGN KEY (goal_id) REFERENCES public.goals(id) ON DELETE CASCADE;