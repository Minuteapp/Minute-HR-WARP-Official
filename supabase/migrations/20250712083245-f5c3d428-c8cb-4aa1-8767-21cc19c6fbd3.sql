-- Erstelle die grundlegenden Roadmap-Planungsstrukturen

-- Erstelle roadmap_planning_boards Tabelle
CREATE TABLE IF NOT EXISTS public.roadmap_planning_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Erstelle roadmap_planning_containers Tabelle
CREATE TABLE IF NOT EXISTS public.roadmap_planning_containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.roadmap_planning_boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'done', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to TEXT[],
  tags TEXT[],
  due_date DATE,
  estimated_hours INTEGER,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  font_size INTEGER DEFAULT 14 CHECK (font_size >= 8 AND font_size <= 72),
  has_sub_containers BOOLEAN DEFAULT false,
  sub_containers_visible BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erstelle roadmap_planning_cards Tabelle
CREATE TABLE IF NOT EXISTS public.roadmap_planning_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES public.roadmap_planning_containers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'done', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to TEXT[],
  tags TEXT[],
  due_date DATE,
  estimated_hours INTEGER,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  style_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_planning_boards_roadmap_id ON public.roadmap_planning_boards(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_planning_containers_board_id ON public.roadmap_planning_containers(board_id);
CREATE INDEX IF NOT EXISTS idx_planning_cards_container_id ON public.roadmap_planning_cards(container_id);

-- RLS Policies aktivieren
ALTER TABLE public.roadmap_planning_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_planning_containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_planning_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies für boards
CREATE POLICY "Users can view their roadmap boards" ON public.roadmap_planning_boards FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = roadmap_planning_boards.roadmap_id
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can create boards for their roadmaps" ON public.roadmap_planning_boards FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = roadmap_planning_boards.roadmap_id
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update their roadmap boards" ON public.roadmap_planning_boards FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = roadmap_planning_boards.roadmap_id
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete their roadmap boards" ON public.roadmap_planning_boards FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = roadmap_planning_boards.roadmap_id
    AND r.created_by = auth.uid()
  )
);

-- RLS Policies für containers
CREATE POLICY "Users can view containers" ON public.roadmap_planning_containers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_boards rpb
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpb.id = roadmap_planning_containers.board_id
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can create containers" ON public.roadmap_planning_containers FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_boards rpb
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpb.id = roadmap_planning_containers.board_id
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update containers" ON public.roadmap_planning_containers FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_boards rpb
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpb.id = roadmap_planning_containers.board_id
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete containers" ON public.roadmap_planning_containers FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_boards rpb
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpb.id = roadmap_planning_containers.board_id
    AND r.created_by = auth.uid()
  )
);

-- RLS Policies für cards
CREATE POLICY "Users can view cards" ON public.roadmap_planning_cards FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_cards.container_id
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can create cards" ON public.roadmap_planning_cards FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_cards.container_id
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update cards" ON public.roadmap_planning_cards FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_cards.container_id
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete cards" ON public.roadmap_planning_cards FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_cards.container_id
    AND r.created_by = auth.uid()
  )
);

-- Trigger für updated_at Zeitstempel
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON public.roadmap_planning_boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_containers_updated_at BEFORE UPDATE ON public.roadmap_planning_containers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.roadmap_planning_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();