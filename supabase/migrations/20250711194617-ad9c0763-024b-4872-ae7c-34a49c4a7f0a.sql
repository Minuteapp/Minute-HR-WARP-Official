-- Füge deleted_at Spalte zur pilot_projects Tabelle hinzu
ALTER TABLE public.pilot_projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;