-- Füge Feld für pausierte Arbeitszeit hinzu
ALTER TABLE public.time_entries 
ADD COLUMN IF NOT EXISTS paused_work_seconds integer DEFAULT 0;

COMMENT ON COLUMN public.time_entries.paused_work_seconds IS 'Gespeicherte Arbeitszeit in Sekunden zum Zeitpunkt der Pausierung';