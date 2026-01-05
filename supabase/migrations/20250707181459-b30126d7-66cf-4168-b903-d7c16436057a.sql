-- Erstelle Roadmap-Tabellen für das Roadmap-Modul

-- Haupttabelle für Roadmaps
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  vision TEXT,
  mission TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'on_hold', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Roadmap-Meilensteine
CREATE TABLE IF NOT EXISTS public.roadmap_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  target_date DATE,
  completion_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  position_x NUMERIC DEFAULT 0,
  position_y NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Roadmap-Verbindungen
CREATE TABLE IF NOT EXISTS public.roadmap_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  source_milestone_id UUID NOT NULL REFERENCES public.roadmap_milestones(id) ON DELETE CASCADE,
  target_milestone_id UUID NOT NULL REFERENCES public.roadmap_milestones(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL DEFAULT 'depends_on' CHECK (connection_type IN ('depends_on', 'blocks', 'related_to')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Roadmap-Templates
CREATE TABLE IF NOT EXISTS public.roadmap_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'product', 'tech', 'marketing', 'custom')),
  template_data JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies für roadmaps
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view roadmaps" ON public.roadmaps
  FOR SELECT USING (true);

CREATE POLICY "Users can create roadmaps" ON public.roadmaps
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own roadmaps" ON public.roadmaps
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all roadmaps" ON public.roadmaps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- RLS Policies für roadmap_milestones
ALTER TABLE public.roadmap_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view milestones" ON public.roadmap_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps 
      WHERE id = roadmap_milestones.roadmap_id
    )
  );

CREATE POLICY "Users can manage milestones of their roadmaps" ON public.roadmap_milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps 
      WHERE id = roadmap_milestones.roadmap_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ))
    )
  );

-- RLS Policies für roadmap_connections
ALTER TABLE public.roadmap_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view connections" ON public.roadmap_connections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps 
      WHERE id = roadmap_connections.roadmap_id
    )
  );

CREATE POLICY "Users can manage connections of their roadmaps" ON public.roadmap_connections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps 
      WHERE id = roadmap_connections.roadmap_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ))
    )
  );

-- RLS Policies für roadmap_templates
ALTER TABLE public.roadmap_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates" ON public.roadmap_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates" ON public.roadmap_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" ON public.roadmap_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Trigger für updated_at Felder
CREATE OR REPLACE FUNCTION update_roadmap_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roadmaps_updated_at
  BEFORE UPDATE ON public.roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_updated_at();

CREATE TRIGGER update_roadmap_milestones_updated_at
  BEFORE UPDATE ON public.roadmap_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_updated_at();

CREATE TRIGGER update_roadmap_templates_updated_at
  BEFORE UPDATE ON public.roadmap_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_updated_at();