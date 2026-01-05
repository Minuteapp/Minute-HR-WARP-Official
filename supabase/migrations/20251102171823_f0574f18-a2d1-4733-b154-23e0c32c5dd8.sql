-- SCHRITT 2 FINAL: Trigger UND Funktion temporär droppen
DROP TRIGGER IF EXISTS calendar_event_changes ON calendar_events;
DROP FUNCTION IF EXISTS log_calendar_event_changes() CASCADE;