
-- =====================================================
-- PHASE 0: VORBEREITUNG & SICHERUNG
-- Migration Journal und Quarantine-Infrastruktur
-- =====================================================

-- 0. Zuerst is_super_admin Funktion erstellen falls nicht vorhanden
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
      AND role = 'super_admin'
  );
END;
$$;

-- 1. Migration Journal Tabelle für Audit-Trail
CREATE TABLE IF NOT EXISTS public.migration_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL DEFAULT gen_random_uuid(),
  phase TEXT NOT NULL,
  step TEXT NOT NULL,
  table_name TEXT,
  rows_before INTEGER,
  rows_after INTEGER,
  rows_quarantined INTEGER DEFAULT 0,
  rows_migrated INTEGER DEFAULT 0,
  operator TEXT DEFAULT current_user,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'rolled_back')),
  details JSONB,
  rollback_sql TEXT,
  error_message TEXT
);

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_migration_journal_run_id ON public.migration_journal(run_id);
CREATE INDEX IF NOT EXISTS idx_migration_journal_phase ON public.migration_journal(phase);
CREATE INDEX IF NOT EXISTS idx_migration_journal_status ON public.migration_journal(status);

-- RLS für migration_journal (nur Admins)
ALTER TABLE public.migration_journal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only superadmins can view migration journal" ON public.migration_journal;
CREATE POLICY "Only superadmins can view migration journal"
  ON public.migration_journal FOR SELECT
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Only superadmins can insert migration journal" ON public.migration_journal;
CREATE POLICY "Only superadmins can insert migration journal"
  ON public.migration_journal FOR INSERT
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Only superadmins can update migration journal" ON public.migration_journal;
CREATE POLICY "Only superadmins can update migration journal"
  ON public.migration_journal FOR UPDATE
  USING (public.is_super_admin());

-- 2. Quarantine Schema erstellen
CREATE SCHEMA IF NOT EXISTS quarantine;

-- 3. Quarantine Rows Tabelle für nicht zuordenbare Daten
CREATE TABLE IF NOT EXISTS quarantine.rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_schema TEXT NOT NULL DEFAULT 'public',
  source_table TEXT NOT NULL,
  source_pk UUID NOT NULL,
  source_pk_column TEXT DEFAULT 'id',
  payload_json JSONB NOT NULL,
  reason TEXT NOT NULL,
  attribution_attempts JSONB DEFAULT '[]'::jsonb,
  detected_at TIMESTAMPTZ DEFAULT now(),
  detected_by TEXT DEFAULT current_user,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution TEXT CHECK (resolution IN ('assigned_tenant', 'deleted', 'restored', 'merged')),
  resolution_details JSONB,
  migration_run_id UUID
);

-- Indizes für Quarantine
CREATE INDEX IF NOT EXISTS idx_quarantine_rows_source ON quarantine.rows(source_table, source_pk);
CREATE INDEX IF NOT EXISTS idx_quarantine_rows_reason ON quarantine.rows(reason);
CREATE INDEX IF NOT EXISTS idx_quarantine_rows_resolved ON quarantine.rows(resolved_at) WHERE resolved_at IS NULL;

-- 4. Quarantine für Storage-Objekte
CREATE TABLE IF NOT EXISTS quarantine.storage_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id TEXT NOT NULL,
  object_path TEXT NOT NULL,
  object_size BIGINT,
  content_type TEXT,
  original_owner_id UUID,
  attempted_tenant_id UUID,
  reason TEXT NOT NULL,
  metadata JSONB,
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolution TEXT
);

CREATE INDEX IF NOT EXISTS idx_quarantine_storage_bucket ON quarantine.storage_objects(bucket_id);

-- 5. Hilfsfunktion: Migration Journal Eintrag erstellen
CREATE OR REPLACE FUNCTION public.log_migration_step(
  p_run_id UUID,
  p_phase TEXT,
  p_step TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_rows_before INTEGER DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO migration_journal (run_id, phase, step, table_name, rows_before, details)
  VALUES (p_run_id, p_phase, p_step, p_table_name, p_rows_before, p_details)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- 6. Hilfsfunktion: Migration Journal Eintrag abschließen
CREATE OR REPLACE FUNCTION public.complete_migration_step(
  p_journal_id UUID,
  p_rows_after INTEGER DEFAULT NULL,
  p_rows_quarantined INTEGER DEFAULT 0,
  p_rows_migrated INTEGER DEFAULT 0,
  p_status TEXT DEFAULT 'completed',
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE migration_journal
  SET 
    rows_after = p_rows_after,
    rows_quarantined = p_rows_quarantined,
    rows_migrated = p_rows_migrated,
    completed_at = now(),
    status = p_status,
    error_message = p_error_message
  WHERE id = p_journal_id;
END;
$$;

-- 7. Hilfsfunktion: Row in Quarantine verschieben
CREATE OR REPLACE FUNCTION public.quarantine_row(
  p_source_table TEXT,
  p_source_pk UUID,
  p_payload JSONB,
  p_reason TEXT,
  p_migration_run_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO quarantine.rows (source_table, source_pk, payload_json, reason, migration_run_id)
  VALUES (p_source_table, p_source_pk, p_payload, p_reason, p_migration_run_id)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- 8. View für Migration Status Übersicht
CREATE OR REPLACE VIEW public.migration_status_summary AS
SELECT 
  run_id,
  phase,
  COUNT(*) as total_steps,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_steps,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_steps,
  COUNT(*) FILTER (WHERE status = 'running') as running_steps,
  SUM(COALESCE(rows_migrated, 0)) as total_rows_migrated,
  SUM(COALESCE(rows_quarantined, 0)) as total_rows_quarantined,
  MIN(started_at) as started_at,
  MAX(completed_at) as completed_at
FROM migration_journal
GROUP BY run_id, phase
ORDER BY MIN(started_at) DESC;
