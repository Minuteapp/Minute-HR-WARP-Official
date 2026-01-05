-- Korrigierte Funktion: employees.id statt employees.user_id
CREATE OR REPLACE FUNCTION public.notify_sick_leave_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_employee_name TEXT;
  v_manager_id UUID;
BEGIN
  -- Hole Mitarbeitername aus profiles
  SELECT full_name INTO v_employee_name 
  FROM profiles 
  WHERE id = NEW.user_id;

  -- Finde zuständigen Manager aus employees Tabelle
  -- KORREKTUR: employees.id statt employees.user_id
  SELECT manager_id INTO v_manager_id 
  FROM employees 
  WHERE id = NEW.user_id
  LIMIT 1;

  -- Benachrichtigung bei Genehmigung
  IF NEW.status = 'approved' AND (OLD IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO unified_notifications (
      user_id, source_module, source_id, source_table,
      notification_type, title, message, priority, metadata
    ) VALUES (
      NEW.user_id, 'sick_leave', NEW.id::TEXT, 'sick_leaves',
      'sick_leave_approved', 'Krankmeldung genehmigt',
      'Ihre Krankmeldung vom ' || TO_CHAR(NEW.start_date, 'DD.MM.YYYY') || ' wurde genehmigt.',
      'medium',
      jsonb_build_object('approved_by', NEW.approved_by, 'approved_at', NEW.approved_at)
    );
  END IF;

  -- Benachrichtigung bei Ablehnung
  IF NEW.status = 'rejected' AND (OLD IS NULL OR OLD.status != 'rejected') THEN
    INSERT INTO unified_notifications (
      user_id, source_module, source_id, source_table,
      notification_type, title, message, priority, metadata
    ) VALUES (
      NEW.user_id, 'sick_leave', NEW.id::TEXT, 'sick_leaves',
      'sick_leave_rejected', 'Krankmeldung abgelehnt',
      'Ihre Krankmeldung vom ' || TO_CHAR(NEW.start_date, 'DD.MM.YYYY') || ' wurde abgelehnt.',
      'high',
      jsonb_build_object('rejected_by', NEW.rejected_by, 'rejected_at', NEW.rejected_at)
    );
  END IF;

  -- Benachrichtigung an Manager bei neuer/verlängerter Krankmeldung
  IF (NEW.status = 'pending' AND OLD IS NULL) OR 
     (NEW.status = 'pending' AND OLD.end_date IS DISTINCT FROM NEW.end_date) THEN
    IF v_manager_id IS NOT NULL THEN
      INSERT INTO unified_notifications (
        user_id, source_module, source_id, source_table,
        notification_type, title, message, priority, metadata
      ) VALUES (
        v_manager_id, 'sick_leave', NEW.id::TEXT, 'sick_leaves',
        'sick_leave_approval_required', 'Krankmeldung erfordert Genehmigung',
        COALESCE(v_employee_name, 'Ein Mitarbeiter') || ' hat eine Krankmeldung eingereicht.',
        'high',
        jsonb_build_object('employee_id', NEW.user_id, 'start_date', NEW.start_date, 'end_date', NEW.end_date)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;