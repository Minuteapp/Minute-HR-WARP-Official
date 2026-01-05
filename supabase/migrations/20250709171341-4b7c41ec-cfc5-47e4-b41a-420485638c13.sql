-- Füge Felder für Arbeitszeiten zur employees Tabelle hinzu
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS work_start_time TIME,
ADD COLUMN IF NOT EXISTS work_end_time TIME,
ADD COLUMN IF NOT EXISTS lunch_break_start TIME,
ADD COLUMN IF NOT EXISTS lunch_break_end TIME,
ADD COLUMN IF NOT EXISTS work_schedule JSONB DEFAULT '{}'::jsonb;