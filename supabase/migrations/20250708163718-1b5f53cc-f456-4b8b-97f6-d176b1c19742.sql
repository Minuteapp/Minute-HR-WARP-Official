-- Füge metadata Spalte zu projects Tabelle hinzu
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Füge metadata Spalte zu tasks Tabelle hinzu  
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Füge Kommentare für bessere Dokumentation hinzu
COMMENT ON COLUMN public.projects.metadata IS 'Zusätzliche Metadaten für Projekte im JSON-Format';
COMMENT ON COLUMN public.tasks.metadata IS 'Zusätzliche Metadaten für Aufgaben im JSON-Format';