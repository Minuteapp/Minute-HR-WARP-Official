-- Füge milestones Spalte zur roadmaps Tabelle hinzu
ALTER TABLE public.roadmaps 
ADD COLUMN milestones jsonb DEFAULT '[]'::jsonb;