-- Korrigiere die bestehende Aufgabe mit leerem Titel
UPDATE tasks 
SET title = 'Unbenannte Aufgabe'
WHERE id = 'cb90d8ed-2f25-47e6-882f-1609d4e3d021' 
  AND (title IS NULL OR title = '');