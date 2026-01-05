-- Migration: Erweiterte Genehmigungsfunktionen (korrigiert)
-- 1. Tabelle für Rückfragen zu Abwesenheitsanträgen
CREATE TABLE IF NOT EXISTS absence_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  absence_request_id UUID REFERENCES absence_requests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  asked_by UUID REFERENCES auth.users(id),
  asked_by_name TEXT,
  response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies für absence_queries
ALTER TABLE absence_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view queries for their requests"
ON absence_queries FOR SELECT
USING (
  absence_request_id IN (
    SELECT id FROM absence_requests WHERE user_id = auth.uid()
  )
  OR asked_by = auth.uid()
);

CREATE POLICY "Admins can manage queries"
ON absence_queries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 2. Spalte für Ablehnungsgrund hinzufügen
ALTER TABLE absence_requests
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. PostgreSQL Funktion für durchschnittliche Bearbeitungszeit
CREATE OR REPLACE FUNCTION calculate_avg_processing_time()
RETURNS NUMERIC AS $$
DECLARE
  avg_days NUMERIC;
BEGIN
  SELECT AVG(EXTRACT(EPOCH FROM (approved_at - created_at)) / 86400)
  INTO avg_days
  FROM absence_requests
  WHERE status IN ('approved', 'rejected')
  AND approved_at IS NOT NULL
  AND created_at > NOW() - INTERVAL '90 days';
  
  RETURN COALESCE(ROUND(avg_days, 1), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;