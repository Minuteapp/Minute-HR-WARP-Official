
-- Füge die fehlende child_name Spalte zur sick_leaves Tabelle hinzu
ALTER TABLE public.sick_leaves 
ADD COLUMN IF NOT EXISTS child_name TEXT;
