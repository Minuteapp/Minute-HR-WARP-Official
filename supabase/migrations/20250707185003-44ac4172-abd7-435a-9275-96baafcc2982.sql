-- Füge progress Spalte zur roadmaps Tabelle hinzu
ALTER TABLE public.roadmaps 
ADD COLUMN progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);

-- Erstelle einen Index für bessere Performance
CREATE INDEX idx_roadmaps_progress ON public.roadmaps(progress);