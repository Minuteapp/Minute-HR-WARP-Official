-- SICHERHEITSREPARATUR TEIL 3: Alle verbleibenden Funktionen härten (SET search_path)

-- 1. notify_new_absence_request
CREATE OR REPLACE FUNCTION public.notify_new_absence_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_employee_company uuid;
  rec record;
  v_subject text;
  v_message text;
BEGIN
  SELECT company_id INTO v_employee_company
  FROM public.employees
  WHERE id = NEW.user_id;

  v_subject := 'Neuer Abwesenheitsantrag eingegangen';
  v_message := 'Neuer Antrag von ' || COALESCE(NEW.employee_name,'Mitarbeiter') ||
               ' (' || COALESCE(NEW.department,'Abteilung unbekannt') || '): ' ||
               COALESCE(NEW.type, NEW.absence_type, 'Unbekannt') || ' ' ||
               NEW.start_date::text || ' bis ' || NEW.end_date::text ||
               CASE WHEN COALESCE(NEW.half_day, false) THEN ' (Halber Tag)' ELSE '' END;

  FOR rec IN
    SELECT ur.user_id, u.email
    FROM public.user_roles ur
    LEFT JOIN auth.users u ON u.id = ur.user_id
    WHERE ur.role IN ('admin','hr')
      AND (ur.company_id = v_employee_company OR v_employee_company IS NULL)
  LOOP
    INSERT INTO public.absence_auto_notifications (
      absence_request_id,
      notification_type,
      recipient_user_id,
      recipient_email,
      subject,
      message
    ) VALUES (
      NEW.id,
      'new_request',
      rec.user_id,
      COALESCE(rec.email, 'no-reply@example.com'),
      v_subject,
      v_message
    );
  END LOOP;

  RETURN NEW;
END;
$function$;

-- 2. check_absence_conflicts_on_shift_creation
CREATE OR REPLACE FUNCTION public.check_absence_conflicts_on_shift_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  absence_exists BOOLEAN;
  absence_info RECORD;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.absence_requests ar
    WHERE ar.user_id = NEW.employee_id
    AND ar.status = 'approved'
    AND NEW.date BETWEEN ar.start_date AND ar.end_date
  ) INTO absence_exists;
  
  IF absence_exists THEN
    SELECT ar.type, ar.reason, ar.employee_name 
    INTO absence_info
    FROM public.absence_requests ar
    WHERE ar.user_id = NEW.employee_id
    AND ar.status = 'approved'
    AND NEW.date BETWEEN ar.start_date AND ar.end_date
    LIMIT 1;
    
    NEW.status := 'conflict';
    NEW.notes := COALESCE(NEW.notes || ' | ', '') || 
                 'Konflikt mit genehmigter Abwesenheit (' || 
                 COALESCE(absence_info.type, 'Unbekannt') || ')';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. handle_approved_absence
CREATE OR REPLACE FUNCTION public.handle_approved_absence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    PERFORM net.http_post(
      url := 'https://teydpbqficbdgqovoqlo.supabase.co/functions/v1/update-vacation-days',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 4. notify_absence_status_change
CREATE OR REPLACE FUNCTION public.notify_absence_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF OLD.status != NEW.status AND NEW.status IN ('approved', 'rejected') THEN
    IF NEW.user_id IS NOT NULL THEN
      INSERT INTO absence_notifications (
        absence_request_id,
        user_id,
        notification_type,
        message,
        created_at
      ) VALUES (
        NEW.id,
        NEW.user_id,
        CASE 
          WHEN NEW.status = 'approved' THEN 'approval'
          WHEN NEW.status = 'rejected' THEN 'rejection'
        END,
        CASE 
          WHEN NEW.status = 'approved' THEN 'Ihr Abwesenheitsantrag wurde genehmigt.'
          WHEN NEW.status = 'rejected' THEN COALESCE('Ihr Abwesenheitsantrag wurde abgelehnt. Grund: ' || NEW.rejection_reason, 'Ihr Abwesenheitsantrag wurde abgelehnt.')
        END,
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 5. calculate_sla_due_date
CREATE OR REPLACE FUNCTION public.calculate_sla_due_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  sla_hours INTEGER;
BEGIN
  SELECT resolution_time_hours INTO sla_hours
  FROM public.ticket_sla_policies tsp
  WHERE tsp.category_id = NEW.category_id 
    AND tsp.priority = NEW.priority
    AND tsp.is_active = true
  LIMIT 1;
  
  IF sla_hours IS NULL THEN
    sla_hours := CASE NEW.priority
      WHEN 'urgent' THEN 4
      WHEN 'high' THEN 8
      WHEN 'medium' THEN 24
      ELSE 48
    END;
  END IF;
  
  NEW.sla_due_at := NEW.created_at + (sla_hours || ' hours')::interval;
  
  RETURN NEW;
END;
$function$;

-- 6. increment_template_usage
CREATE OR REPLACE FUNCTION public.increment_template_usage()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE public.ticket_templates 
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 7. notify_document_upload
CREATE OR REPLACE FUNCTION public.notify_document_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.document_notifications (
        document_id, 
        user_id, 
        notification_type, 
        message
    )
    SELECT 
        NEW.id, 
        user_id,
        'new_document',
        'Neues Dokument hochgeladen: ' || NEW.title
    FROM auth.users
    WHERE user_id IN (
        SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'superadmin')
    );
    
    RETURN NEW;
END;
$function$;

-- 8. update_company_employee_count
CREATE OR REPLACE FUNCTION public.update_company_employee_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.company_id IS NOT NULL THEN
    UPDATE companies 
    SET employee_count = employee_count + 1 
    WHERE id = NEW.company_id;
  ELSIF TG_OP = 'DELETE' AND OLD.company_id IS NOT NULL THEN
    UPDATE companies 
    SET employee_count = employee_count - 1 
    WHERE id = OLD.company_id;
  END IF;
  RETURN NULL;
END;
$function$;

-- 9. check_document_duplicate
CREATE OR REPLACE FUNCTION public.check_document_duplicate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    IF NEW.duplicate_check_hash IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.documents 
            WHERE duplicate_check_hash = NEW.duplicate_check_hash 
            AND id != NEW.id
            AND deleted_at IS NULL
        ) THEN
            NEW.metadata = jsonb_set(
                COALESCE(NEW.metadata, '{}'::jsonb),
                '{potential_duplicate}',
                'true'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 10. handle_new_chat
CREATE OR REPLACE FUNCTION public.handle_new_chat()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.channel_members (channel_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$function$;

-- 11. link_absences_to_users
CREATE OR REPLACE FUNCTION public.link_absences_to_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN NEW;
END;
$function$;

-- 12. notify_task_status_change
CREATE OR REPLACE FUNCTION public.notify_task_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  task_assignee_id UUID;
  task_title TEXT;
  notification_message TEXT;
BEGIN
  SELECT assigned_to, title INTO task_assignee_id, task_title
  FROM public.tasks 
  WHERE id = NEW.id;
  
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF task_assignee_id IS NOT NULL THEN
      notification_message := 'Status der Aufgabe "' || COALESCE(task_title, 'Unbekannte Aufgabe') || '" wurde zu "' || NEW.status || '" geändert.';
      
      INSERT INTO public.task_notifications (
        task_id,
        user_id,
        notification_type,
        message,
        metadata
      ) VALUES (
        NEW.id,
        task_assignee_id,
        'task_status_changed',
        notification_message,
        jsonb_build_object(
          'old_status', OLD.status,
          'new_status', NEW.status,
          'task_title', task_title
        )
      );
      
      INSERT INTO public.employee_task_activities (
        employee_id,
        task_id,
        activity_type,
        previous_status,
        new_status,
        metadata
      ) VALUES (
        task_assignee_id,
        NEW.id,
        'status_changed',
        OLD.status,
        NEW.status,
        jsonb_build_object(
          'task_title', task_title,
          'changed_by', auth.uid()
        )
      );
    END IF;
    
    IF NEW.status = 'done' THEN
      UPDATE public.tasks 
      SET completed = true, completed_at = NOW()
      WHERE id = NEW.id;
      
      IF task_assignee_id IS NOT NULL THEN
        INSERT INTO public.task_notifications (
          task_id,
          user_id,
          notification_type,
          message,
          metadata
        ) VALUES (
          NEW.id,
          task_assignee_id,
          'task_completed',
          'Aufgabe "' || COALESCE(task_title, 'Unbekannte Aufgabe') || '" wurde als erledigt markiert.',
          jsonb_build_object(
            'completion_date', NOW(),
            'task_title', task_title
          )
        );
        
        INSERT INTO public.employee_task_activities (
          employee_id,
          task_id,
          activity_type,
          completion_date,
          metadata
        ) VALUES (
          task_assignee_id,
          NEW.id,
          'completed',
          NOW(),
          jsonb_build_object(
            'task_title', task_title,
            'completed_by', auth.uid()
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;