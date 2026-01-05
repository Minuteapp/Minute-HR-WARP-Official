-- Audit-Trigger wieder erstellen
DROP TRIGGER IF EXISTS log_absence_changes_trigger ON absence_requests;

CREATE TRIGGER log_absence_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON absence_requests
FOR EACH ROW EXECUTE FUNCTION log_absence_changes();