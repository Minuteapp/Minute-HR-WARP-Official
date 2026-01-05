-- SCHRITT 1: NUR calendar_audit_log bereinigen um Foreign Key Constraint zu lösen
DELETE FROM calendar_audit_log 
WHERE event_id IN (
  SELECT id FROM calendar_events 
  WHERE company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1' 
     OR company_id IS NULL
);