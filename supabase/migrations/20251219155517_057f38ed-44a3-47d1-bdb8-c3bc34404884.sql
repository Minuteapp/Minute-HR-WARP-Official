-- Soft-Delete Spalte für Firmen hinzufügen
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_companies_deleted_at ON public.companies(deleted_at);