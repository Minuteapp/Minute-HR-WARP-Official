-- Erstelle Tabelle für Roadmap-Verknüpfungen zu Projekten und Aufgaben
CREATE TABLE public.roadmap_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID NOT NULL,
  linked_type TEXT NOT NULL CHECK (linked_type IN ('project', 'task', 'milestone')),
  linked_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(roadmap_id, linked_type, linked_id)
);

-- Enable Row Level Security
ALTER TABLE public.roadmap_links ENABLE ROW LEVEL SECURITY;

-- Policies für roadmap_links
CREATE POLICY "Users can view roadmap links"
  ON public.roadmap_links
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create roadmap links"
  ON public.roadmap_links
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own roadmap links"
  ON public.roadmap_links
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own roadmap links"
  ON public.roadmap_links
  FOR DELETE
  USING (auth.uid() = created_by);

-- Index für Performance
CREATE INDEX idx_roadmap_links_roadmap_id ON public.roadmap_links(roadmap_id);
CREATE INDEX idx_roadmap_links_linked ON public.roadmap_links(linked_type, linked_id);