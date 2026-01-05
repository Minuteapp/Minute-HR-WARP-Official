-- =====================================================
-- EMPLOYEE RECOGNITION & AWARDS SYSTEM
-- =====================================================

-- 1. EMPLOYEE AWARDS (Mitarbeiter-Auszeichnungen)
CREATE TABLE IF NOT EXISTS public.employee_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  award_type TEXT NOT NULL CHECK (award_type IN ('employee_of_year', 'employee_of_month', 'top_performer')),
  award_name TEXT NOT NULL,
  award_category TEXT,
  received_date DATE NOT NULL,
  quarter TEXT CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year INTEGER NOT NULL,
  description TEXT,
  badge_color TEXT CHECK (badge_color IN ('yellow', 'orange', 'blue', 'green', 'gray')),
  badge_label TEXT,
  performance_score DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view employee awards"
  ON public.employee_awards FOR SELECT
  USING (true);

CREATE POLICY "HR can manage employee awards"
  ON public.employee_awards FOR ALL
  USING (true);

-- 2. EMPLOYEE TENURE MILESTONES (Betriebszugehörigkeit)
CREATE TABLE IF NOT EXISTS public.employee_tenure_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  tenure_years INTEGER NOT NULL,
  start_date DATE NOT NULL,
  current_milestone_reached BOOLEAN DEFAULT false,
  next_milestone_years INTEGER,
  next_milestone_date DATE,
  milestone_status TEXT CHECK (milestone_status IN ('gefeiert', 'zukünftig')),
  gift_amount DECIMAL(10, 2),
  gift_currency TEXT DEFAULT 'EUR',
  extra_vacation_days INTEGER,
  celebrated_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_tenure_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tenure milestones"
  ON public.employee_tenure_milestones FOR SELECT
  USING (true);

CREATE POLICY "HR can manage tenure milestones"
  ON public.employee_tenure_milestones FOR ALL
  USING (true);

-- 3. EMPLOYEE TEAM AWARDS (Team-Auszeichnungen)
CREATE TABLE IF NOT EXISTS public.employee_team_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  team_id UUID,
  award_name TEXT NOT NULL,
  award_category TEXT,
  received_date DATE NOT NULL,
  quarter TEXT CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year INTEGER NOT NULL,
  description TEXT,
  badge_color TEXT CHECK (badge_color IN ('yellow', 'orange', 'blue', 'green', 'gray')),
  badge_label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_team_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team awards"
  ON public.employee_team_awards FOR SELECT
  USING (true);

CREATE POLICY "HR can manage team awards"
  ON public.employee_team_awards FOR ALL
  USING (true);

-- 4. EMPLOYEE PROJECT ACHIEVEMENTS (Projektleistungen)
CREATE TABLE IF NOT EXISTS public.employee_project_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  project_id UUID,
  project_name TEXT NOT NULL,
  role TEXT NOT NULL,
  year INTEGER NOT NULL,
  description TEXT,
  impact_metrics JSONB,
  badge_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_project_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project achievements"
  ON public.employee_project_achievements FOR SELECT
  USING (true);

CREATE POLICY "HR can manage project achievements"
  ON public.employee_project_achievements FOR ALL
  USING (true);

-- 5. EMPLOYEE PEER KUDOS (Peer Recognition)
CREATE TABLE IF NOT EXISTS public.employee_peer_kudos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_employee_id UUID NOT NULL,
  receiver_employee_id UUID NOT NULL,
  kudos_message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('teamwork', 'innovation', 'excellence', 'leadership')),
  badge_type TEXT,
  sent_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_peer_kudos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view peer kudos"
  ON public.employee_peer_kudos FOR SELECT
  USING (true);

CREATE POLICY "Users can send kudos"
  ON public.employee_peer_kudos FOR INSERT
  WITH CHECK (true);

-- 6. EMPLOYEE KUDOS SUMMARY (Kudos-Zusammenfassung)
CREATE TABLE IF NOT EXISTS public.employee_kudos_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  kudos_received_count INTEGER DEFAULT 0,
  kudos_received_this_year INTEGER DEFAULT 0,
  kudos_sent_count INTEGER DEFAULT 0,
  top_category TEXT,
  top_category_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_kudos_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view kudos summary"
  ON public.employee_kudos_summary FOR SELECT
  USING (true);

CREATE POLICY "System can manage kudos summary"
  ON public.employee_kudos_summary FOR ALL
  USING (true);

-- 7. EMPLOYEE POTENTIAL AWARDS (Potenzielle Auszeichnungen)
CREATE TABLE IF NOT EXISTS public.employee_potential_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  year INTEGER NOT NULL,
  award_name TEXT NOT NULL,
  award_category TEXT,
  probability_score DECIMAL(5, 2),
  progress_percentage INTEGER,
  criteria_description TEXT,
  status TEXT CHECK (status IN ('potential', 'in_review', 'achieved')) DEFAULT 'potential',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_potential_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view potential awards"
  ON public.employee_potential_awards FOR SELECT
  USING (true);

CREATE POLICY "HR can manage potential awards"
  ON public.employee_potential_awards FOR ALL
  USING (true);

-- =====================================================
-- TESTDATEN FÜR DANIEL HÄUSLEIN
-- =====================================================

-- Hole Daniel Häuslein's ID
DO $$
DECLARE
  daniel_id UUID;
BEGIN
  SELECT id INTO daniel_id FROM public.employees WHERE first_name = 'Daniel' AND last_name = 'Häuslein' LIMIT 1;
  
  IF daniel_id IS NOT NULL THEN
    
    -- 1. EMPLOYEE AWARDS
    INSERT INTO public.employee_awards (employee_id, award_type, award_name, award_category, received_date, quarter, year, description, badge_color, badge_label, performance_score) VALUES
    (daniel_id, 'employee_of_year', 'Employee of the Year 2024', 'Overall Excellence', '2024-12-15', 'Q4', 2024, 'Außergewöhnliche Leistungen über das gesamte Jahr in Produktentwicklung und Teamführung', 'yellow', 'Jahresauszeichnung', NULL),
    (daniel_id, 'employee_of_month', 'Employee of the Month', 'Performance', '2024-03-01', 'Q1', 2024, 'Herausragende Leistung bei der Phoenix-Projekt Deadline', 'orange', 'Monat', NULL),
    (daniel_id, 'employee_of_month', 'Employee of the Month', 'Innovation', '2023-07-01', 'Q3', 2023, 'Innovative KI-Integration im Produktbereich', 'orange', 'Monat', NULL),
    (daniel_id, 'employee_of_month', 'Employee of the Month', 'Leadership', '2022-11-01', 'Q4', 2022, 'Exzellente Teamführung während kritischer Projektphase', 'orange', 'Monat', NULL),
    (daniel_id, 'top_performer', 'Top Performer Q3 2025', 'Quarterly Performance', '2025-09-30', 'Q3', 2025, 'Performance-Score von 93% - Top 5% des Unternehmens', 'blue', 'Aktuell', 93.00);

    -- 2. TENURE MILESTONES
    INSERT INTO public.employee_tenure_milestones (employee_id, tenure_years, start_date, current_milestone_reached, next_milestone_years, next_milestone_date, milestone_status, gift_amount, gift_currency, extra_vacation_days, celebrated_date) VALUES
    (daniel_id, 5, '2019-02-01', true, NULL, NULL, 'gefeiert', 500.00, 'EUR', 1, '2024-02-01'),
    (daniel_id, 10, '2019-02-01', false, 10, '2029-02-01', 'zukünftig', 1500.00, 'EUR', 3, NULL);

    -- 3. TEAM AWARDS
    INSERT INTO public.employee_team_awards (employee_id, award_name, award_category, received_date, quarter, year, description, badge_color, badge_label) VALUES
    (daniel_id, 'Best Product Team 2025', 'Team Excellence', '2025-06-30', 'Q2', 2025, 'Erfolgreiches Launch von 3 Major Features in Q2 mit 98% User Satisfaction', 'green', 'Team-Award'),
    (daniel_id, 'Innovation Excellence Award', 'Innovation', '2025-03-31', 'Q1', 2025, 'KI-gestützte Feature-Entwicklung mit 40% Effizienzsteigerung', 'blue', 'Innovation'),
    (daniel_id, 'Customer Satisfaction Excellence', 'Customer Focus', '2024-12-31', 'Q4', 2024, 'NPS Score von 92 - Industry Best Practice', 'green', 'Kundenzufriedenheit'),
    (daniel_id, 'Agile Team of the Quarter', 'Agile Excellence', '2024-06-30', 'Q2', 2024, '100% Sprint Goals erreicht über 6 Monate', 'blue', 'Agile');

    -- 4. PROJECT ACHIEVEMENTS
    INSERT INTO public.employee_project_achievements (employee_id, project_name, role, year, description, impact_metrics, badge_year) VALUES
    (daniel_id, 'Phoenix Projekt', 'Lead Developer', 2025, 'Komplette System-Modernisierung mit React & TypeScript', '{"budget_saved": "-8%", "time_delivered": "On Time", "quality_score": "95%"}', 2025),
    (daniel_id, 'AI Integration Initiative', 'Technical Lead', 2024, 'Implementation von KI-Features in Core Product', '{"roi": "+240%", "user_adoption": "87%", "performance_improvement": "+40%"}', 2024),
    (daniel_id, 'Mobile App 2.0', 'Product Manager', 2023, 'Launch der komplett überarbeiteten Mobile App', '{"app_store_rating": "4.9", "downloads": "250k+", "user_retention": "+65%"}', 2023),
    (daniel_id, 'Security Hardening Project', 'Security Champion', 2023, 'ISO 27001 Zertifizierung & Security Best Practices', '{"certification": "ISO 27001", "vulnerabilities_fixed": "47", "security_score": "A+"}', 2023);

    -- 5. PEER KUDOS (Letzte 3)
    INSERT INTO public.employee_peer_kudos (sender_employee_id, receiver_employee_id, kudos_message, category, badge_type, sent_date) VALUES
    (daniel_id, daniel_id, 'Daniel hat unserem Team bei der kritischen Deadline unglaublich geholfen. Seine technische Expertise und Ruhe unter Druck waren Gold wert!', 'teamwork', 'Teamwork', '2025-10-15 10:30:00'),
    (daniel_id, daniel_id, 'Die KI-Integration, die Daniel entwickelt hat, ist brillant! Innovation at its best.', 'innovation', 'Innovation', '2025-09-22 14:15:00'),
    (daniel_id, daniel_id, 'Daniels Code Reviews sind immer konstruktiv und lehrreich. Top Mentor!', 'excellence', 'Excellence', '2025-08-30 09:45:00');

    -- 6. KUDOS SUMMARY
    INSERT INTO public.employee_kudos_summary (employee_id, year, kudos_received_count, kudos_received_this_year, kudos_sent_count, top_category, top_category_count) VALUES
    (daniel_id, 2025, 47, 12, 38, 'teamwork', 18);

    -- 7. POTENTIAL AWARDS
    INSERT INTO public.employee_potential_awards (employee_id, year, award_name, award_category, probability_score, progress_percentage, criteria_description, status) VALUES
    (daniel_id, 2025, 'Employee of the Year', 'Overall Excellence', 91.00, 91, 'Performance-Score: 91% (Top 15% des Unternehmens)', 'potential'),
    (daniel_id, 2025, 'Innovation Award', 'Innovation', 85.00, 75, '2 eingereichte Innovationen in Review-Phase', 'in_review'),
    (daniel_id, 2026, 'Leadership Excellence', 'Leadership', 85.00, 85, '360-Grad-Feedback: Leadership Skills 85%', 'potential');

  END IF;
END $$;