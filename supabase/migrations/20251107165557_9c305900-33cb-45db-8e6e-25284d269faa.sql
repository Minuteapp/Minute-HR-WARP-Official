-- Migration: Vollständige Mitarbeiter-Profil-Funktionen
-- Erstellt Tabellen für Karriere, Onboarding, Beschäftigung, Feedback

-- ============================================
-- 1. KARRIERE TAB - Tabellen
-- ============================================

-- Talentpool Status
CREATE TABLE IF NOT EXISTS public.talent_pool_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  is_high_potential BOOLEAN DEFAULT false,
  is_key_talent BOOLEAN DEFAULT false,
  retention_risk TEXT CHECK (retention_risk IN ('low', 'medium', 'high')),
  performance_rating TEXT CHECK (performance_rating IN ('excellent', 'good', 'satisfactory', 'needs_improvement')),
  notes TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- Karrierepfad
CREATE TABLE IF NOT EXISTS public.career_path (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  position_title TEXT NOT NULL,
  department TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  salary_amount DECIMAL(10,2),
  salary_currency TEXT DEFAULT 'EUR',
  is_current BOOLEAN DEFAULT false,
  promotion_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Entwicklungsziele
CREATE TABLE IF NOT EXISTS public.career_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('skill_development', 'leadership', 'technical', 'certification', 'project', 'other')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled')) DEFAULT 'not_started',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date DATE,
  completed_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kompetenzlücken
CREATE TABLE IF NOT EXISTS public.competency_gaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  competency_name TEXT NOT NULL,
  current_level INTEGER CHECK (current_level >= 0 AND current_level <= 100),
  target_level INTEGER CHECK (target_level >= 0 AND target_level <= 100),
  development_plan TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Potenzielle Nachfolger
CREATE TABLE IF NOT EXISTS public.succession_planning (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  successor_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  readiness TEXT CHECK (readiness IN ('ready_now', 'ready_1_year', 'ready_2_years', 'ready_3plus_years')) DEFAULT 'ready_1_year',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(position_id, successor_id)
);

-- ============================================
-- 2. ONBOARDING TAB - Tabellen
-- ============================================

-- Onboarding Checklisten
CREATE TABLE IF NOT EXISTS public.onboarding_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('admin', 'it', 'training', 'team', 'equipment', 'other')) DEFAULT 'other',
  is_completed BOOLEAN DEFAULT false,
  completed_date TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  due_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Onboarding Meilensteine
CREATE TABLE IF NOT EXISTS public.onboarding_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_date DATE,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')) DEFAULT 'pending',
  responsible_person_id UUID REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Equipment Zuweisungen
CREATE TABLE IF NOT EXISTS public.equipment_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  equipment_type TEXT CHECK (equipment_type IN ('laptop', 'monitor', 'phone', 'tablet', 'keyboard', 'mouse', 'headset', 'other')) DEFAULT 'other',
  serial_number TEXT,
  status TEXT CHECK (status IN ('ordered', 'delivered', 'assigned', 'returned')) DEFAULT 'ordered',
  assigned_date DATE,
  return_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Onboarding Buddy Zuweisungen
CREATE TABLE IF NOT EXISTS public.onboarding_buddies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  buddy_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- ============================================
-- 3. BESCHÄFTIGUNG TAB - Tabellen
-- ============================================

-- Mitarbeiter Skills
CREATE TABLE IF NOT EXISTS public.employee_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT CHECK (skill_category IN ('technical', 'soft_skill', 'language', 'certification', 'tool', 'other')) DEFAULT 'other',
  proficiency_level INTEGER CHECK (proficiency_level >= 0 AND proficiency_level <= 100) DEFAULT 50,
  years_of_experience DECIMAL(3,1),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mitarbeiter Zertifikate
CREATE TABLE IF NOT EXISTS public.employee_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  certificate_name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  certificate_number TEXT,
  document_url TEXT,
  status TEXT CHECK (status IN ('active', 'expired', 'revoked')) DEFAULT 'active',
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- 4. FEEDBACK TAB - Tabellen
-- ============================================

-- Feedback Reviews (360°)
CREATE TABLE IF NOT EXISTS public.feedback_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  review_type TEXT CHECK (review_type IN ('360', 'performance', 'probation', 'annual', 'quarterly')) DEFAULT '360',
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
  self_assessment_completed BOOLEAN DEFAULT false,
  manager_assessment_completed BOOLEAN DEFAULT false,
  overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  summary TEXT,
  development_plan TEXT,
  created_by UUID REFERENCES auth.users(id),
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feedback Anfragen (wer soll Feedback geben)
CREATE TABLE IF NOT EXISTS public.feedback_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.feedback_reviews(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  reviewer_type TEXT CHECK (reviewer_type IN ('self', 'manager', 'peer', 'direct_report', 'other')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'declined')) DEFAULT 'pending',
  sent_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  reminder_sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, reviewer_id)
);

-- Feedback Antworten
CREATE TABLE IF NOT EXISTS public.feedback_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.feedback_requests(id) ON DELETE CASCADE,
  competency_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  strengths TEXT,
  areas_for_improvement TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- 5. RLS POLICIES - Aktivieren
-- ============================================

-- Karriere Tabellen
ALTER TABLE public.talent_pool_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_path ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.succession_planning ENABLE ROW LEVEL SECURITY;

-- Onboarding Tabellen
ALTER TABLE public.onboarding_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_buddies ENABLE ROW LEVEL SECURITY;

-- Beschäftigung Tabellen
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_certificates ENABLE ROW LEVEL SECURITY;

-- Feedback Tabellen
ALTER TABLE public.feedback_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES - HR Admins können alles sehen/bearbeiten
-- ============================================

-- Helper function für HR Admin Check
CREATE OR REPLACE FUNCTION public.is_hr_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('hr_admin', 'admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Karriere Policies
CREATE POLICY "HR Admins können alle Talentpool-Status sehen" ON public.talent_pool_status FOR SELECT USING (is_hr_admin());
CREATE POLICY "HR Admins können Talentpool-Status bearbeiten" ON public.talent_pool_status FOR ALL USING (is_hr_admin());

CREATE POLICY "HR Admins können alle Karrierepfade sehen" ON public.career_path FOR SELECT USING (is_hr_admin());
CREATE POLICY "HR Admins können Karrierepfade bearbeiten" ON public.career_path FOR ALL USING (is_hr_admin());

CREATE POLICY "Mitarbeiter können eigene Ziele sehen" ON public.career_goals FOR SELECT USING (employee_id IN (SELECT id FROM public.employees WHERE id = auth.uid()) OR is_hr_admin());
CREATE POLICY "HR Admins können alle Ziele bearbeiten" ON public.career_goals FOR ALL USING (is_hr_admin());

CREATE POLICY "HR Admins können Kompetenzlücken sehen" ON public.competency_gaps FOR SELECT USING (is_hr_admin());
CREATE POLICY "HR Admins können Kompetenzlücken bearbeiten" ON public.competency_gaps FOR ALL USING (is_hr_admin());

CREATE POLICY "HR Admins können Nachfolgeplanung sehen" ON public.succession_planning FOR SELECT USING (is_hr_admin());
CREATE POLICY "HR Admins können Nachfolgeplanung bearbeiten" ON public.succession_planning FOR ALL USING (is_hr_admin());

-- Onboarding Policies
CREATE POLICY "HR Admins können alle Checklisten sehen" ON public.onboarding_checklists FOR SELECT USING (is_hr_admin());
CREATE POLICY "HR Admins können Checklisten bearbeiten" ON public.onboarding_checklists FOR ALL USING (is_hr_admin());

CREATE POLICY "HR Admins können alle Meilensteine sehen" ON public.onboarding_milestones FOR SELECT USING (is_hr_admin());
CREATE POLICY "HR Admins können Meilensteine bearbeiten" ON public.onboarding_milestones FOR ALL USING (is_hr_admin());

CREATE POLICY "HR Admins können Equipment sehen" ON public.equipment_assignments FOR SELECT USING (is_hr_admin());
CREATE POLICY "HR Admins können Equipment bearbeiten" ON public.equipment_assignments FOR ALL USING (is_hr_admin());

CREATE POLICY "HR Admins können Buddies sehen" ON public.onboarding_buddies FOR SELECT USING (is_hr_admin());
CREATE POLICY "HR Admins können Buddies bearbeiten" ON public.onboarding_buddies FOR ALL USING (is_hr_admin());

-- Beschäftigung Policies
CREATE POLICY "HR Admins können alle Skills sehen" ON public.employee_skills FOR SELECT USING (is_hr_admin());
CREATE POLICY "HR Admins können Skills bearbeiten" ON public.employee_skills FOR ALL USING (is_hr_admin());

CREATE POLICY "HR Admins können alle Zertifikate sehen" ON public.employee_certificates FOR SELECT USING (is_hr_admin());
CREATE POLICY "HR Admins können Zertifikate bearbeiten" ON public.employee_certificates FOR ALL USING (is_hr_admin());

-- Feedback Policies
CREATE POLICY "HR Admins und betroffene Mitarbeiter können Reviews sehen" ON public.feedback_reviews FOR SELECT USING (employee_id IN (SELECT id FROM public.employees WHERE id = auth.uid()) OR is_hr_admin());
CREATE POLICY "HR Admins können Reviews bearbeiten" ON public.feedback_reviews FOR ALL USING (is_hr_admin());

CREATE POLICY "Reviewer können eigene Anfragen sehen" ON public.feedback_requests FOR SELECT USING (reviewer_id IN (SELECT id FROM public.employees WHERE id = auth.uid()) OR is_hr_admin());
CREATE POLICY "HR Admins können Feedback-Anfragen bearbeiten" ON public.feedback_requests FOR ALL USING (is_hr_admin());

CREATE POLICY "Reviewer können eigene Antworten sehen" ON public.feedback_responses FOR SELECT USING (request_id IN (SELECT id FROM public.feedback_requests WHERE reviewer_id IN (SELECT id FROM public.employees WHERE id = auth.uid())) OR is_hr_admin());
CREATE POLICY "Reviewer können eigene Antworten erstellen" ON public.feedback_responses FOR INSERT WITH CHECK (request_id IN (SELECT id FROM public.feedback_requests WHERE reviewer_id IN (SELECT id FROM public.employees WHERE id = auth.uid())));
CREATE POLICY "HR Admins können alle Antworten bearbeiten" ON public.feedback_responses FOR ALL USING (is_hr_admin());

-- ============================================
-- 7. TRIGGER für updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für alle Tabellen
CREATE TRIGGER update_talent_pool_status_updated_at BEFORE UPDATE ON public.talent_pool_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_career_path_updated_at BEFORE UPDATE ON public.career_path FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_career_goals_updated_at BEFORE UPDATE ON public.career_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_competency_gaps_updated_at BEFORE UPDATE ON public.competency_gaps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_succession_planning_updated_at BEFORE UPDATE ON public.succession_planning FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_onboarding_checklists_updated_at BEFORE UPDATE ON public.onboarding_checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_onboarding_milestones_updated_at BEFORE UPDATE ON public.onboarding_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_equipment_assignments_updated_at BEFORE UPDATE ON public.equipment_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_onboarding_buddies_updated_at BEFORE UPDATE ON public.onboarding_buddies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_skills_updated_at BEFORE UPDATE ON public.employee_skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_certificates_updated_at BEFORE UPDATE ON public.employee_certificates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feedback_reviews_updated_at BEFORE UPDATE ON public.feedback_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feedback_requests_updated_at BEFORE UPDATE ON public.feedback_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feedback_responses_updated_at BEFORE UPDATE ON public.feedback_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. INDIZES für Performance
-- ============================================

CREATE INDEX idx_talent_pool_employee ON public.talent_pool_status(employee_id);
CREATE INDEX idx_career_path_employee ON public.career_path(employee_id);
CREATE INDEX idx_career_goals_employee ON public.career_goals(employee_id);
CREATE INDEX idx_competency_gaps_employee ON public.competency_gaps(employee_id);
CREATE INDEX idx_succession_position ON public.succession_planning(position_id);
CREATE INDEX idx_succession_successor ON public.succession_planning(successor_id);
CREATE INDEX idx_onboarding_checklists_employee ON public.onboarding_checklists(employee_id);
CREATE INDEX idx_onboarding_milestones_employee ON public.onboarding_milestones(employee_id);
CREATE INDEX idx_equipment_employee ON public.equipment_assignments(employee_id);
CREATE INDEX idx_onboarding_buddies_employee ON public.onboarding_buddies(employee_id);
CREATE INDEX idx_employee_skills_employee ON public.employee_skills(employee_id);
CREATE INDEX idx_employee_certificates_employee ON public.employee_certificates(employee_id);
CREATE INDEX idx_feedback_reviews_employee ON public.feedback_reviews(employee_id);
CREATE INDEX idx_feedback_requests_review ON public.feedback_requests(review_id);
CREATE INDEX idx_feedback_requests_reviewer ON public.feedback_requests(reviewer_id);
CREATE INDEX idx_feedback_responses_request ON public.feedback_responses(request_id);