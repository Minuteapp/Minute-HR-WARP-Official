-- Fehlende Spalten zur roadmap_planning_containers Tabelle hinzufügen
ALTER TABLE public.roadmap_planning_containers 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';