-- Additional Notifications Triggers for Absence, Calendar, HR-Cases, Documents

-- =====================================================
-- ABSENCE NOTIFICATIONS TRIGGERS
-- =====================================================

-- Trigger: Urlaubsantrag erstellt
CREATE OR REPLACE FUNCTION trigger_absence_request_created_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_approver_id UUID;
BEGIN
  -- Company ID ermitteln
  SELECT company_id INTO v_company_id
  FROM public.employees
  WHERE id = NEW.user_id
  LIMIT 1;
  
  -- Approver ermitteln (HR oder Admin der gleichen Firma)
  SELECT ur.user_id INTO v_approver_id
  FROM user_roles ur
  WHERE ur.company_id = v_company_id
  AND ur.role IN ('hr', 'hr_manager', 'admin')
  LIMIT 1;
  
  -- Notification an Approver
  IF v_approver_id IS NOT NULL THEN
    PERFORM create_unified_notification(
      p_user_id := v_approver_id,
      p_source_module := 'absence',
      p_source_id := NEW.id,
      p_source_table := 'absence_requests',
      p_notification_type := 'absence_request_created',
      p_title := '📅 Neuer Urlaubsantrag',
      p_message := format('%s hat einen Urlaubsantrag eingereicht (%s Tage)', 
        NEW.employee_name, 
        EXTRACT(DAY FROM (NEW.end_date - NEW.start_date)) + 1),
      p_priority := 'medium',
      p_action_url := '/absence/requests/' || NEW.id::text,
      p_metadata := jsonb_build_object(
        'absence_type', NEW.type,
        'start_date', NEW.start_date,
        'end_date', NEW.end_date,
        'employee_name', NEW.employee_name,
        'reason', NEW.reason
      ),
      p_company_id := v_company_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER absence_request_created_notification
AFTER INSERT ON public.absence_requests
FOR EACH ROW
EXECUTE FUNCTION trigger_absence_request_created_notification();

-- Trigger: Urlaubsantrag genehmigt
CREATE OR REPLACE FUNCTION trigger_absence_request_approved_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Company ID ermitteln
  SELECT company_id INTO v_company_id
  FROM public.employees
  WHERE id = NEW.user_id
  LIMIT 1;
  
  -- Status-Änderung zu "approved"
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Notification an Antragsteller
    PERFORM create_unified_notification(
      p_user_id := NEW.user_id,
      p_source_module := 'absence',
      p_source_id := NEW.id,
      p_source_table := 'absence_requests',
      p_notification_type := 'absence_request_approved',
      p_title := '✅ Urlaubsantrag genehmigt',
      p_message := format('Ihr Urlaubsantrag vom %s bis %s wurde genehmigt', 
        NEW.start_date, NEW.end_date),
      p_priority := 'high',
      p_action_url := '/absence/requests/' || NEW.id::text,
      p_metadata := jsonb_build_object(
        'absence_type', NEW.type,
        'start_date', NEW.start_date,
        'end_date', NEW.end_date,
        'approved_by', NEW.approved_by,
        'approved_at', NEW.approved_at
      ),
      p_company_id := v_company_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER absence_request_approved_notification
AFTER UPDATE ON public.absence_requests
FOR EACH ROW
EXECUTE FUNCTION trigger_absence_request_approved_notification();

-- Trigger: Urlaubsantrag abgelehnt
CREATE OR REPLACE FUNCTION trigger_absence_request_rejected_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Company ID ermitteln
  SELECT company_id INTO v_company_id
  FROM public.employees
  WHERE id = NEW.user_id
  LIMIT 1;
  
  -- Status-Änderung zu "rejected"
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    -- Notification an Antragsteller
    PERFORM create_unified_notification(
      p_user_id := NEW.user_id,
      p_source_module := 'absence',
      p_source_id := NEW.id,
      p_source_table := 'absence_requests',
      p_notification_type := 'absence_request_rejected',
      p_title := '❌ Urlaubsantrag abgelehnt',
      p_message := format('Ihr Urlaubsantrag vom %s bis %s wurde abgelehnt', 
        NEW.start_date, NEW.end_date),
      p_priority := 'high',
      p_action_url := '/absence/requests/' || NEW.id::text,
      p_metadata := jsonb_build_object(
        'absence_type', NEW.type,
        'start_date', NEW.start_date,
        'end_date', NEW.end_date,
        'rejected_by', NEW.rejected_by,
        'rejection_reason', NEW.rejection_reason
      ),
      p_company_id := v_company_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER absence_request_rejected_notification
AFTER UPDATE ON public.absence_requests
FOR EACH ROW
EXECUTE FUNCTION trigger_absence_request_rejected_notification();

-- =====================================================
-- CALENDAR NOTIFICATIONS TRIGGERS
-- =====================================================

-- Trigger: Termin-Erinnerung (bei Erstellung für Termine in naher Zukunft)
CREATE OR REPLACE FUNCTION trigger_calendar_event_reminder_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hours_until_event INTEGER;
BEGIN
  -- Berechne Stunden bis zum Event
  v_hours_until_event := EXTRACT(EPOCH FROM (NEW.start_time - NOW())) / 3600;
  
  -- Nur für Events innerhalb der nächsten 24 Stunden
  IF v_hours_until_event > 0 AND v_hours_until_event <= 24 THEN
    PERFORM create_unified_notification(
      p_user_id := NEW.created_by,
      p_source_module := 'calendar',
      p_source_id := NEW.id,
      p_source_table := 'calendar_events',
      p_notification_type := 'calendar_event_reminder',
      p_title := '🔔 Termin-Erinnerung',
      p_message := format('Termin "%s" beginnt in %s Stunden', 
        NEW.title, 
        ROUND(v_hours_until_event::numeric, 1)),
      p_priority := CASE 
        WHEN v_hours_until_event <= 1 THEN 'critical'
        WHEN v_hours_until_event <= 3 THEN 'high'
        ELSE 'medium'
      END,
      p_action_url := '/calendar?event=' || NEW.id::text,
      p_metadata := jsonb_build_object(
        'event_title', NEW.title,
        'start_time', NEW.start_time,
        'end_time', NEW.end_time,
        'event_type', NEW.type,
        'hours_until', v_hours_until_event
      ),
      p_company_id := NEW.company_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER calendar_event_reminder_notification
AFTER INSERT ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION trigger_calendar_event_reminder_notification();

-- Trigger: Termin-Konflikt (bei Überschneidungen)
CREATE OR REPLACE FUNCTION trigger_calendar_event_conflict_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conflict_count INTEGER;
BEGIN
  -- Prüfe auf überschneidende Events
  SELECT COUNT(*) INTO v_conflict_count
  FROM public.calendar_events ce
  WHERE ce.created_by = NEW.created_by
  AND ce.id != NEW.id
  AND ce.start_time < NEW.end_time
  AND ce.end_time > NEW.start_time;
  
  -- Notification bei Konflikt
  IF v_conflict_count > 0 THEN
    PERFORM create_unified_notification(
      p_user_id := NEW.created_by,
      p_source_module := 'calendar',
      p_source_id := NEW.id,
      p_source_table := 'calendar_events',
      p_notification_type := 'calendar_event_conflict',
      p_title := '⚠️ Termin-Konflikt',
      p_message := format('Termin "%s" überschneidet sich mit %s anderen Terminen', 
        NEW.title, v_conflict_count),
      p_priority := 'high',
      p_action_url := '/calendar?event=' || NEW.id::text,
      p_metadata := jsonb_build_object(
        'event_title', NEW.title,
        'start_time', NEW.start_time,
        'end_time', NEW.end_time,
        'conflict_count', v_conflict_count
      ),
      p_company_id := NEW.company_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER calendar_event_conflict_notification
AFTER INSERT OR UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION trigger_calendar_event_conflict_notification();

-- =====================================================
-- HR CASES NOTIFICATIONS TRIGGERS
-- =====================================================

-- Trigger: Neuer HR-Fall erstellt
CREATE OR REPLACE FUNCTION trigger_hr_case_created_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hr_user_id UUID;
BEGIN
  -- Hole HR Mitarbeiter der gleichen Firma
  SELECT ur.user_id INTO v_hr_user_id
  FROM user_roles ur
  WHERE ur.company_id = NEW.company_id
  AND ur.role IN ('hr', 'hr_manager', 'admin')
  LIMIT 1;
  
  -- Notification an HR
  IF v_hr_user_id IS NOT NULL AND v_hr_user_id != NEW.created_by THEN
    PERFORM create_unified_notification(
      p_user_id := v_hr_user_id,
      p_source_module := 'hr_cases',
      p_source_id := NEW.id,
      p_source_table := 'hr_cases',
      p_notification_type := 'hr_case_created',
      p_title := '📋 Neuer HR-Fall',
      p_message := format('Neuer HR-Fall erstellt: %s (%s)', 
        NEW.title, NEW.category),
      p_priority := CASE 
        WHEN NEW.priority = 'urgent' THEN 'critical'
        WHEN NEW.priority = 'high' THEN 'high'
        ELSE 'medium'
      END,
      p_action_url := '/hr/cases/' || NEW.id::text,
      p_metadata := jsonb_build_object(
        'case_title', NEW.title,
        'case_category', NEW.category,
        'case_priority', NEW.priority,
        'employee_id', NEW.employee_id
      ),
      p_company_id := NEW.company_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER hr_case_created_notification
AFTER INSERT ON public.hr_cases
FOR EACH ROW
EXECUTE FUNCTION trigger_hr_case_created_notification();

-- Trigger: HR-Fall Status-Update
CREATE OR REPLACE FUNCTION trigger_hr_case_status_update_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Status-Änderung
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notification an Case Creator
    IF NEW.created_by IS NOT NULL AND NEW.created_by != auth.uid() THEN
      PERFORM create_unified_notification(
        p_user_id := NEW.created_by,
        p_source_module := 'hr_cases',
        p_source_id := NEW.id,
        p_source_table := 'hr_cases',
        p_notification_type := 'hr_case_status_updated',
        p_title := '🔄 HR-Fall Status aktualisiert',
        p_message := format('Status von "%s" geändert: %s → %s', 
          NEW.title, OLD.status, NEW.status),
        p_priority := 'medium',
        p_action_url := '/hr/cases/' || NEW.id::text,
        p_metadata := jsonb_build_object(
          'case_title', NEW.title,
          'old_status', OLD.status,
          'new_status', NEW.status,
          'updated_by', auth.uid()
        ),
        p_company_id := NEW.company_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER hr_case_status_update_notification
AFTER UPDATE ON public.hr_cases
FOR EACH ROW
EXECUTE FUNCTION trigger_hr_case_status_update_notification();

-- =====================================================
-- DOCUMENTS NOTIFICATIONS TRIGGERS
-- =====================================================

-- Trigger: Neues Dokument hochgeladen
CREATE OR REPLACE FUNCTION trigger_document_uploaded_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_user_id UUID;
BEGIN
  -- Hole Admin der gleichen Firma
  SELECT ur.user_id INTO v_admin_user_id
  FROM user_roles ur
  WHERE ur.company_id = NEW.company_id
  AND ur.role IN ('admin', 'superadmin')
  AND ur.user_id != NEW.uploaded_by
  LIMIT 1;
  
  -- Notification an Admin (falls vorhanden)
  IF v_admin_user_id IS NOT NULL THEN
    PERFORM create_unified_notification(
      p_user_id := v_admin_user_id,
      p_source_module := 'documents',
      p_source_id := NEW.id,
      p_source_table := 'documents',
      p_notification_type := 'document_uploaded',
      p_title := '📄 Neues Dokument hochgeladen',
      p_message := format('Dokument "%s" wurde hochgeladen (%s)', 
        NEW.title, NEW.document_type),
      p_priority := 'low',
      p_action_url := '/documents/' || NEW.id::text,
      p_metadata := jsonb_build_object(
        'document_title', NEW.title,
        'document_type', NEW.document_type,
        'file_size', NEW.file_size,
        'uploaded_by', NEW.uploaded_by
      ),
      p_company_id := NEW.company_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER document_uploaded_notification
AFTER INSERT ON public.documents
FOR EACH ROW
EXECUTE FUNCTION trigger_document_uploaded_notification();

-- Trigger: Dokument freigegeben/genehmigt
CREATE OR REPLACE FUNCTION trigger_document_approved_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Status-Änderung zu "approved"
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Notification an Uploader
    IF NEW.uploaded_by IS NOT NULL THEN
      PERFORM create_unified_notification(
        p_user_id := NEW.uploaded_by,
        p_source_module := 'documents',
        p_source_id := NEW.id,
        p_source_table := 'documents',
        p_notification_type := 'document_approved',
        p_title := '✅ Dokument genehmigt',
        p_message := format('Ihr Dokument "%s" wurde genehmigt', NEW.title),
        p_priority := 'medium',
        p_action_url := '/documents/' || NEW.id::text,
        p_metadata := jsonb_build_object(
          'document_title', NEW.title,
          'document_type', NEW.document_type,
          'approved_at', NOW()
        ),
        p_company_id := NEW.company_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER document_approved_notification
AFTER UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION trigger_document_approved_notification();