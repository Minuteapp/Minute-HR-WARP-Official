-- Füge die fehlende auto_time_tracking Spalte zur tasks Tabelle hinzu
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS auto_time_tracking boolean DEFAULT false;