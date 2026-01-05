-- Bereinige verwaiste Zeiteinträge, die end_time haben aber noch als active/pending markiert sind
UPDATE time_entries 
SET status = 'completed', 
    updated_at = now()
WHERE status IN ('active', 'pending') 
  AND end_time IS NOT NULL;