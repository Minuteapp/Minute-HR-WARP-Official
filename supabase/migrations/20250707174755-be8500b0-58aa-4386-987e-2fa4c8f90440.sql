-- Erstelle Tabellen für das Roadmap-Modul

-- Haupttabelle für Roadmaps
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  vision TEXT,
  mission TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'on_hold', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  company_id UUID NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint für Datum-Validierung
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Tabelle für Roadmap-Milestones
CREATE TABLE IF NOT EXISTS public.roadmap_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  target_date DATE NOT NULL,
  completion_date DATE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  dependencies JSONB DEFAULT '[]'::jsonb,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabelle für Roadmap-Verbindungen zwischen Milestones
CREATE TABLE IF NOT EXISTS public.roadmap_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  source_milestone_id UUID NOT NULL REFERENCES public.roadmap_milestones(id) ON DELETE CASCADE,
  target_milestone_id UUID NOT NULL REFERENCES public.roadmap_milestones(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL DEFAULT 'depends_on' CHECK (connection_type IN ('depends_on', 'blocks', 'related_to')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Verhindere Zyklen und Duplikate
  CONSTRAINT unique_connection UNIQUE (source_milestone_id, target_milestone_id),
  CONSTRAINT no_self_reference CHECK (source_milestone_id != target_milestone_id)
);

-- Tabelle für Roadmap-Templates
CREATE TABLE IF NOT EXISTS public.roadmap_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'product', 'tech', 'marketing', 'custom')),
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  company_id UUID,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies für roadmaps
CREATE POLICY "Users can view roadmaps in their company" 
ON public.roadmaps 
FOR SELECT 
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create roadmaps in their company" 
ON public.roadmaps 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND created_by = auth.uid()
);

CREATE POLICY "Users can update roadmaps in their company" 
ON public.roadmaps 
FOR UPDATE 
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete roadmaps they created" 
ON public.roadmaps 
FOR DELETE 
USING (created_by = auth.uid());

-- RLS Policies für roadmap_milestones
CREATE POLICY "Users can view milestones in their company roadmaps" 
ON public.roadmap_milestones 
FOR SELECT 
USING (
  roadmap_id IN (
    SELECT id FROM public.roadmaps 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create milestones in their company roadmaps" 
ON public.roadmap_milestones 
FOR INSERT 
WITH CHECK (
  roadmap_id IN (
    SELECT id FROM public.roadmaps 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update milestones in their company roadmaps" 
ON public.roadmap_milestones 
FOR UPDATE 
USING (
  roadmap_id IN (
    SELECT id FROM public.roadmaps 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete milestones in their company roadmaps" 
ON public.roadmap_milestones 
FOR DELETE 
USING (
  roadmap_id IN (
    SELECT id FROM public.roadmaps 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policies für roadmap_connections
CREATE POLICY "Users can view connections in their company roadmaps" 
ON public.roadmap_connections 
FOR SELECT 
USING (
  roadmap_id IN (
    SELECT id FROM public.roadmaps 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create connections in their company roadmaps" 
ON public.roadmap_connections 
FOR INSERT 
WITH CHECK (
  roadmap_id IN (
    SELECT id FROM public.roadmaps 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update connections in their company roadmaps" 
ON public.roadmap_connections 
FOR UPDATE 
USING (
  roadmap_id IN (
    SELECT id FROM public.roadmaps 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete connections in their company roadmaps" 
ON public.roadmap_connections 
FOR DELETE 
USING (
  roadmap_id IN (
    SELECT id FROM public.roadmaps 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policies für roadmap_templates
CREATE POLICY "Users can view public templates and their own templates" 
ON public.roadmap_templates 
FOR SELECT 
USING (
  is_public = true OR 
  created_by = auth.uid() OR
  (company_id IS NOT NULL AND company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Users can create templates" 
ON public.roadmap_templates 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates" 
ON public.roadmap_templates 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates" 
ON public.roadmap_templates 
FOR DELETE 
USING (created_by = auth.uid());

-- Indizes für Performance
CREATE INDEX idx_roadmaps_company_id ON public.roadmaps(company_id);
CREATE INDEX idx_roadmaps_status ON public.roadmaps(status);
CREATE INDEX idx_roadmaps_start_date ON public.roadmaps(start_date);
CREATE INDEX idx_roadmaps_end_date ON public.roadmaps(end_date);

CREATE INDEX idx_roadmap_milestones_roadmap_id ON public.roadmap_milestones(roadmap_id);
CREATE INDEX idx_roadmap_milestones_status ON public.roadmap_milestones(status);
CREATE INDEX idx_roadmap_milestones_target_date ON public.roadmap_milestones(target_date);

CREATE INDEX idx_roadmap_connections_roadmap_id ON public.roadmap_connections(roadmap_id);
CREATE INDEX idx_roadmap_connections_source ON public.roadmap_connections(source_milestone_id);
CREATE INDEX idx_roadmap_connections_target ON public.roadmap_connections(target_milestone_id);

CREATE INDEX idx_roadmap_templates_category ON public.roadmap_templates(category);
CREATE INDEX idx_roadmap_templates_public ON public.roadmap_templates(is_public);

-- Triggers für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roadmaps_updated_at
    BEFORE UPDATE ON public.roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmap_milestones_updated_at
    BEFORE UPDATE ON public.roadmap_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmap_templates_updated_at
    BEFORE UPDATE ON public.roadmap_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();