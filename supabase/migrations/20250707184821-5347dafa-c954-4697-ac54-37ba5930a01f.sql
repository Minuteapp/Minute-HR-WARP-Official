-- Füge priority Spalte zur roadmaps Tabelle hinzu
ALTER TABLE public.roadmaps 
ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical'));

-- Erstelle einen Index für bessere Performance
CREATE INDEX idx_roadmaps_priority ON public.roadmaps(priority);