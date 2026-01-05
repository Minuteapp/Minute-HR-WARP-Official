-- Erstelle Roadmap Planning Tabellen
CREATE TABLE IF NOT EXISTS public.roadmap_planning_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS public.roadmap_planning_containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.roadmap_planning_boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#3B82F6',
  status TEXT DEFAULT 'planned',
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  due_date DATE,
  estimated_hours INTEGER,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  font_size INTEGER DEFAULT 14,
  has_sub_containers BOOLEAN DEFAULT FALSE,
  sub_containers_visible BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roadmap_planning_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES public.roadmap_planning_containers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned',
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  due_date DATE,
  estimated_hours INTEGER,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#FFFFFF',
  style_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.roadmap_planning_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_planning_containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_planning_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies für roadmap_planning_boards (vereinfacht ohne collaborators)
CREATE POLICY "Users can view boards from their roadmaps" ON public.roadmap_planning_boards
  FOR SELECT USING (
    roadmap_id IN (
      SELECT id FROM public.roadmaps 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create boards for their roadmaps" ON public.roadmap_planning_boards
  FOR INSERT WITH CHECK (
    roadmap_id IN (
      SELECT id FROM public.roadmaps 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update boards for their roadmaps" ON public.roadmap_planning_boards
  FOR UPDATE USING (
    roadmap_id IN (
      SELECT id FROM public.roadmaps 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete boards for their roadmaps" ON public.roadmap_planning_boards
  FOR DELETE USING (
    roadmap_id IN (
      SELECT id FROM public.roadmaps 
      WHERE created_by = auth.uid()
    )
  );

-- RLS Policies für roadmap_planning_containers
CREATE POLICY "Users can view containers from accessible boards" ON public.roadmap_planning_containers
  FOR SELECT USING (
    board_id IN (
      SELECT rpb.id FROM public.roadmap_planning_boards rpb
      JOIN public.roadmaps r ON r.id = rpb.roadmap_id
      WHERE r.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create containers for accessible boards" ON public.roadmap_planning_containers
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT rpb.id FROM public.roadmap_planning_boards rpb
      JOIN public.roadmaps r ON r.id = rpb.roadmap_id
      WHERE r.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update containers for accessible boards" ON public.roadmap_planning_containers
  FOR UPDATE USING (
    board_id IN (
      SELECT rpb.id FROM public.roadmap_planning_boards rpb
      JOIN public.roadmaps r ON r.id = rpb.roadmap_id
      WHERE r.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete containers for accessible boards" ON public.roadmap_planning_containers
  FOR DELETE USING (
    board_id IN (
      SELECT rpb.id FROM public.roadmap_planning_boards rpb
      JOIN public.roadmaps r ON r.id = rpb.roadmap_id
      WHERE r.created_by = auth.uid()
    )
  );

-- RLS Policies für roadmap_planning_cards
CREATE POLICY "Users can view cards from accessible containers" ON public.roadmap_planning_cards
  FOR SELECT USING (
    container_id IN (
      SELECT rpc.id FROM public.roadmap_planning_containers rpc
      JOIN public.roadmap_planning_boards rpb ON rpb.id = rpc.board_id
      JOIN public.roadmaps r ON r.id = rpb.roadmap_id
      WHERE r.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create cards for accessible containers" ON public.roadmap_planning_cards
  FOR INSERT WITH CHECK (
    container_id IN (
      SELECT rpc.id FROM public.roadmap_planning_containers rpc
      JOIN public.roadmap_planning_boards rpb ON rpb.id = rpc.board_id
      JOIN public.roadmaps r ON r.id = rpb.roadmap_id
      WHERE r.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update cards for accessible containers" ON public.roadmap_planning_cards
  FOR UPDATE USING (
    container_id IN (
      SELECT rpc.id FROM public.roadmap_planning_containers rpc
      JOIN public.roadmap_planning_boards rpb ON rpb.id = rpc.board_id
      JOIN public.roadmaps r ON r.id = rpb.roadmap_id
      WHERE r.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards for accessible containers" ON public.roadmap_planning_cards
  FOR DELETE USING (
    container_id IN (
      SELECT rpc.id FROM public.roadmap_planning_containers rpc
      JOIN public.roadmap_planning_boards rpb ON rpb.id = rpc.board_id
      JOIN public.roadmaps r ON r.id = rpb.roadmap_id
      WHERE r.created_by = auth.uid()
    )
  );

-- Trigger für automatische updated_at Aktualisierung
CREATE OR REPLACE FUNCTION update_roadmap_planning_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roadmap_planning_boards_updated_at
  BEFORE UPDATE ON public.roadmap_planning_boards
  FOR EACH ROW EXECUTE FUNCTION update_roadmap_planning_updated_at();

CREATE TRIGGER update_roadmap_planning_containers_updated_at
  BEFORE UPDATE ON public.roadmap_planning_containers
  FOR EACH ROW EXECUTE FUNCTION update_roadmap_planning_updated_at();

CREATE TRIGGER update_roadmap_planning_cards_updated_at
  BEFORE UPDATE ON public.roadmap_planning_cards
  FOR EACH ROW EXECUTE FUNCTION update_roadmap_planning_updated_at();