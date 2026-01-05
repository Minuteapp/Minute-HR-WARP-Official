-- Fix: Audit-Trigger mit korrekten action_type Werten
CREATE OR REPLACE FUNCTION log_employee_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_action_type text;
BEGIN
  -- Postgres TG_OP auf erlaubte action_types mappen
  IF TG_OP = 'INSERT' THEN
    v_action_type := 'profile_update';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Prüfen ob es ein Archivierungs-Update ist
    IF NEW.archived = true AND (OLD.archived IS NULL OR OLD.archived = false) THEN
      v_action_type := 'archive';
    ELSIF NEW.archived = false AND OLD.archived = true THEN
      v_action_type := 'restore';
    ELSE
      v_action_type := 'profile_update';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_action_type := 'delete';
  END IF;

  INSERT INTO employee_audit_logs (
    employee_id, 
    action_type, 
    performed_by, 
    details, 
    company_id,
    performed_at
  )
  VALUES (
    COALESCE(NEW.id, OLD.id),
    v_action_type,
    auth.uid(),
    jsonb_build_object(
      'old', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
      'new', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
    ),
    COALESCE(NEW.company_id, OLD.company_id),
    now()
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Test-Daten archivieren
UPDATE employees 
SET archived = true, 
    archived_at = now(), 
    status = 'inactive'
WHERE email LIKE 'test-%@%.local';