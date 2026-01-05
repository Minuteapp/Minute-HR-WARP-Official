-- Beende den aktuell aktiven Zeiteintrag für diesen Benutzer
UPDATE time_entries 
SET end_time = now(), 
    status = 'completed', 
    updated_at = now()
WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2' 
  AND status = 'active' 
  AND end_time IS NULL;