-- Employee Onboarding Tables

-- Onboarding Processes
CREATE TABLE IF NOT EXISTS public.onboarding_processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'preboarding', 'in_progress', 'completed')),
  start_date DATE,
  completion_date DATE,
  mentor_id UUID,
  preboarding_started_at TIMESTAMP WITH TIME ZONE,
  gamification_score INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  feedback_submitted BOOLEAN DEFAULT false,
  feedback_requested_at TIMESTAMP WITH TIME ZONE,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Onboarding Checklist Items
CREATE TABLE IF NOT EXISTS public.onboarding_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID NOT NULL REFERENCES public.onboarding_processes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  type TEXT NOT NULL DEFAULT 'regular' CHECK (type IN ('regular', 'it_setup', 'feedback', 'goal')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assignee_id UUID,
  points INTEGER DEFAULT 10,
  position INTEGER DEFAULT 0,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Onboarding Feedback
CREATE TABLE IF NOT EXISTS public.onboarding_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID NOT NULL REFERENCES public.onboarding_processes(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('week1', 'day30', 'day90')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  anonymous BOOLEAN DEFAULT false,
  improvement_suggestions TEXT,
  satisfaction_areas TEXT[],
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Onboarding Badges
CREATE TABLE IF NOT EXISTS public.onboarding_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}',
  image_url TEXT,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Badges (earned badges)
CREATE TABLE IF NOT EXISTS public.employee_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.onboarding_badges(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.onboarding_processes(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  company_id UUID
);

-- Onboarding Wiki Articles
CREATE TABLE IF NOT EXISTS public.onboarding_wiki_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('structure', 'tools', 'culture', 'contacts', 'general')),
  tags TEXT[] DEFAULT '{}',
  video_url TEXT,
  created_by UUID NOT NULL,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Onboarding Wiki Attachments
CREATE TABLE IF NOT EXISTS public.onboarding_wiki_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.onboarding_wiki_articles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL,
  company_id UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IT Setup Items
CREATE TABLE IF NOT EXISTS public.onboarding_it_setup_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID NOT NULL REFERENCES public.onboarding_processes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_role TEXT NOT NULL DEFAULT 'it_department' CHECK (assignee_role IN ('it_department', 'system_admin', 'employee')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Onboarding Levels (for gamification)
CREATE TABLE IF NOT EXISTS public.onboarding_levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  min_points INTEGER NOT NULL,
  badge_id UUID REFERENCES public.onboarding_badges(id),
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Onboarding Goals
CREATE TABLE IF NOT EXISTS public.onboarding_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID NOT NULL REFERENCES public.onboarding_processes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  feedback TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER DEFAULT 20,
  linked_goal_id UUID,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.onboarding_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_wiki_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_it_setup_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_goals ENABLE ROW LEVEL SECURITY;

-- Company isolation function (if not exists)
CREATE OR REPLACE FUNCTION get_user_company_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT company_id 
  FROM user_roles 
  WHERE user_id = user_uuid 
  AND company_id IS NOT NULL
  LIMIT 1;
$$;

-- Superadmin check function (if not exists)
CREATE OR REPLACE FUNCTION is_superadmin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'superadmin'
  );
$$;

-- RLS Policies for Company Isolation

-- Onboarding Processes
CREATE POLICY "Company isolation for onboarding_processes"
ON public.onboarding_processes FOR SELECT
USING (
  is_superadmin(auth.uid()) OR
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Company isolation for onboarding_processes_insert"
ON public.onboarding_processes FOR INSERT
WITH CHECK (
  is_superadmin(auth.uid()) OR
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Company isolation for onboarding_processes_update"
ON public.onboarding_processes FOR UPDATE
USING (
  is_superadmin(auth.uid()) OR
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- Apply similar patterns to other tables
CREATE POLICY "Company isolation for checklist_items"
ON public.onboarding_checklist_items FOR ALL
USING (
  is_superadmin(auth.uid()) OR
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Company isolation for feedback"
ON public.onboarding_feedback FOR ALL
USING (
  is_superadmin(auth.uid()) OR
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Company isolation for badges"
ON public.onboarding_badges FOR ALL
USING (
  is_superadmin(auth.uid()) OR
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Company isolation for employee_badges"
ON public.employee_badges FOR ALL
USING (
  is_superadmin(auth.uid()) OR
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Company isolation for wiki_articles"
ON public.onboarding_wiki_articles FOR ALL
USING (
  is_superadmin(auth.uid()) OR
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Company isolation for wiki_attachments"
ON public.onboarding_wiki_attachments FOR ALL
USING (
  is_superadmin(auth.uid()) OR
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Company isolation for it_setup_items"
ON public.onboarding_it_setup_items FOR ALL
USING (
  is_superadmin(auth.uid()) OR
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Company isolation for levels"
ON public.onboarding_levels FOR ALL
USING (
  is_superadmin(auth.uid()) OR
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Company isolation for goals"
ON public.onboarding_goals FOR ALL
USING (
  is_superadmin(auth.uid()) OR
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- Insert default badges
INSERT INTO public.onboarding_badges (name, description, icon, criteria) VALUES
('Erste Schritte', 'Für das Abschließen der ersten Onboarding-Aufgaben', '🌟', '{"type": "checklist_completion", "value": 25}'),
('Team-Player', 'Für aktive Teilnahme an Teamaktivitäten', '🤝', '{"type": "team_engagement", "value": 1}'),
('Schnellstarter', 'Für das Abschließen des Onboardings in Rekordzeit', '⚡', '{"type": "completion_speed", "value": 7}'),
('Wissbegierig', 'Für das Durchlesen aller Wiki-Artikel', '📚', '{"type": "wiki_articles_read", "value": 10}')
ON CONFLICT DO NOTHING;

-- Insert default levels
INSERT INTO public.onboarding_levels (name, description, min_points) VALUES
('Neuling', 'Gerade erst angefangen', 0),
('Einsteiger', 'Macht gute Fortschritte', 50),
('Fortgeschritten', 'Kennt sich schon gut aus', 150),
('Experte', 'Fast am Ziel angekommen', 300),
('Onboarding-Champion', 'Hat das Onboarding erfolgreich abgeschlossen', 500)
ON CONFLICT DO NOTHING;