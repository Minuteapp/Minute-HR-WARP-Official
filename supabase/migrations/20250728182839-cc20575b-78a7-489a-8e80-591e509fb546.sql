-- Füge die fehlende analysis_version Spalte zur innovation_ai_insights Tabelle hinzu
ALTER TABLE innovation_ai_insights 
ADD COLUMN IF NOT EXISTS analysis_version TEXT DEFAULT '1.0';

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_innovation_ai_insights_analysis_version 
ON innovation_ai_insights(analysis_version);