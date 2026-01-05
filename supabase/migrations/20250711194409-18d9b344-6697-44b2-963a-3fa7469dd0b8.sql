-- Erstelle Pilotprojekte Tabelle für das Innovation Hub
CREATE TABLE IF NOT EXISTS public.pilot_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  idea_id UUID REFERENCES public.innovation_ideas(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'pilot_phase', 'scaling', 'completed', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  budget NUMERIC,
  success_metrics TEXT[] DEFAULT ARRAY[]::TEXT[],
  responsible_person TEXT NOT NULL,
  team_members TEXT[] DEFAULT ARRAY[]::TEXT[],
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  risk_assessment TEXT,
  learnings TEXT,
  next_steps TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies für Pilotprojekte
ALTER TABLE public.pilot_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all pilot projects" ON public.pilot_projects
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can create pilot projects" ON public.pilot_projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own pilot projects" ON public.pilot_projects
  FOR UPDATE USING (auth.uid() = created_by OR is_admin(auth.uid()));

CREATE POLICY "Admins can delete pilot projects" ON public.pilot_projects
  FOR DELETE USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_pilot_projects_status ON public.pilot_projects(status);
CREATE INDEX IF NOT EXISTS idx_pilot_projects_created_by ON public.pilot_projects(created_by);

-- Trigger für updated_at
CREATE TRIGGER update_pilot_projects_updated_at
  BEFORE UPDATE ON public.pilot_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_innovation_updated_at();