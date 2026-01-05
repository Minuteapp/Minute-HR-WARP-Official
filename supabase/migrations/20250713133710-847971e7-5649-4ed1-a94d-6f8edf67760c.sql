-- Füge notes Spalte zur tasks Tabelle hinzu
ALTER TABLE public.tasks 
ADD COLUMN notes TEXT;