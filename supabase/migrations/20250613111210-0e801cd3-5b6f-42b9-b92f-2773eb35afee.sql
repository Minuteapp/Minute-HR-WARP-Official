
-- Erweiterte Dokumentenverwaltung
CREATE TABLE IF NOT EXISTS public.document_project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  relevance_score NUMERIC DEFAULT 0.5,
  auto_linked BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(document_id, project_id)
);

CREATE TABLE IF NOT EXISTS public.document_task_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  relevance_score NUMERIC DEFAULT 0.5,
  auto_linked BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(document_id, task_id)
);

-- Erweiterte Mitarbeiterverwaltung
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS performance_rating NUMERIC,
ADD COLUMN IF NOT EXISTS last_review_date DATE,
ADD COLUMN IF NOT EXISTS next_review_date DATE;

-- Skill-Management
CREATE TABLE IF NOT EXISTS public.employee_project_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  confidence_score NUMERIC DEFAULT 0.5,
  acquired_date DATE DEFAULT CURRENT_DATE,
  verified_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.skill_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  position_title TEXT,
  skill_name TEXT NOT NULL,
  required_level TEXT CHECK (required_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  importance TEXT CHECK (importance IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Training und Empfehlungen
CREATE TABLE IF NOT EXISTS public.training_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  skill_gap TEXT NOT NULL,
  recommended_training TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  confidence_score NUMERIC DEFAULT 0.5,
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'completed', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies für neue Tabellen
ALTER TABLE public.document_project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_task_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_recommendations ENABLE ROW LEVEL SECURITY;

-- Basis-Policies (können später verfeinert werden)
CREATE POLICY "Allow authenticated users to view document links" ON public.document_project_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to view task links" ON public.document_task_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to view employee skills" ON public.employee_project_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to view skill requirements" ON public.skill_requirements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to view training recommendations" ON public.training_recommendations FOR SELECT TO authenticated USING (true);

-- Trigger für automatische Dokumentverknüpfung (wird später implementiert)
CREATE OR REPLACE FUNCTION public.auto_link_documents()
RETURNS TRIGGER AS $$
BEGIN
  -- Placeholder für automatische Verknüpfungslogik
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für Trainingsempfehlungen
CREATE OR REPLACE FUNCTION public.update_training_recommendations_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Placeholder für Trainingsempfehlungslogik
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
