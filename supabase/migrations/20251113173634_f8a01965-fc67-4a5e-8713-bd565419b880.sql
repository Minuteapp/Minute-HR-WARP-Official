-- Genehmigungsworkflow für Krankmeldungen

-- Funktion zum Senden von Benachrichtigungen bei Statusänderungen
CREATE OR REPLACE FUNCTION notify_sick_leave_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_employee_name TEXT;
  v_manager_id UUID;
BEGIN
  -- Hole Mitarbeitername
  SELECT full_name INTO v_employee_name 
  FROM profiles 
  WHERE id = NEW.user_id;

  -- Finde zuständigen Manager (falls profiles Tabelle manager_id hat)
  SELECT manager_id INTO v_manager_id 
  FROM profiles 
  WHERE id = NEW.user_id;

  -- Benachrichtigung bei Genehmigung
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO unified_notifications (
      user_id,
      source_module,
      source_id,
      source_table,
      notification_type,
      title,
      message,
      priority,
      metadata
    ) VALUES (
      NEW.user_id,
      'sick_leave',
      NEW.id::TEXT,
      'sick_leaves',
      'sick_leave_approved',
      'Krankmeldung genehmigt',
      'Ihre Krankmeldung vom ' || TO_CHAR(NEW.start_date, 'DD.MM.YYYY') || ' wurde genehmigt.',
      'medium',
      jsonb_build_object('approved_by', NEW.approved_by, 'approved_at', NEW.approved_at)
    );
  END IF;

  -- Benachrichtigung bei Ablehnung
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    INSERT INTO unified_notifications (
      user_id,
      source_module,
      source_id,
      source_table,
      notification_type,
      title,
      message,
      priority,
      metadata
    ) VALUES (
      NEW.user_id,
      'sick_leave',
      NEW.id::TEXT,
      'sick_leaves',
      'sick_leave_rejected',
      'Krankmeldung abgelehnt',
      'Ihre Krankmeldung vom ' || TO_CHAR(NEW.start_date, 'DD.MM.YYYY') || ' wurde abgelehnt.',
      'high',
      jsonb_build_object('rejected_by', NEW.rejected_by, 'rejected_at', NEW.rejected_at)
    );
  END IF;

  -- Benachrichtigung an Manager bei neuer/verlängerter Krankmeldung
  IF (NEW.status = 'pending' AND OLD.status IS NULL) OR 
     (NEW.status = 'pending' AND OLD.end_date != NEW.end_date) THEN
    IF v_manager_id IS NOT NULL THEN
      INSERT INTO unified_notifications (
        user_id,
        source_module,
        source_id,
        source_table,
        notification_type,
        title,
        message,
        priority,
        metadata
      ) VALUES (
        v_manager_id,
        'sick_leave',
        NEW.id::TEXT,
        'sick_leaves',
        'sick_leave_approval_required',
        'Krankmeldung erfordert Genehmigung',
        COALESCE(v_employee_name, 'Ein Mitarbeiter') || ' hat eine Krankmeldung eingereicht.',
        'high',
        jsonb_build_object('employee_id', NEW.user_id, 'start_date', NEW.start_date, 'end_date', NEW.end_date)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für Krankmeldungs-Benachrichtigungen
DROP TRIGGER IF EXISTS sick_leave_approval_notification ON sick_leaves;
CREATE TRIGGER sick_leave_approval_notification
AFTER INSERT OR UPDATE OF status, end_date ON sick_leaves
FOR EACH ROW
EXECUTE FUNCTION notify_sick_leave_approval();