-- Füge priority Spalte zur roadmap_planning Tabelle hinzu
ALTER TABLE public.roadmap_planning 
ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));

-- Erstelle einen Index für bessere Performance
CREATE INDEX idx_roadmap_planning_priority ON public.roadmap_planning(priority);