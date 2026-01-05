-- Hinzufügen der fehlenden isAllDay Spalte zur calendar_events Tabelle
ALTER TABLE calendar_events 
ADD COLUMN is_all_day BOOLEAN DEFAULT false;