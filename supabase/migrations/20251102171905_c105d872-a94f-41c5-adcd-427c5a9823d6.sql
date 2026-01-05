-- SCHRITT 2C: Nur Tabellen mit company_id Feld
DELETE FROM tasks WHERE company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';
DELETE FROM projects WHERE company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';
DELETE FROM calendar_events WHERE company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1' OR company_id IS NULL;
DELETE FROM business_trips WHERE company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1' OR company_id IS NULL;
DELETE FROM goals WHERE company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';
DELETE FROM objectives WHERE company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';