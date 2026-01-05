-- Aktiviere Row Level Security für alle betroffenen Tabellen
ALTER TABLE public.calendar_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_ui_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_folder_links ENABLE ROW LEVEL SECURITY;

-- Korrigiere Search Path für alle betroffenen Funktionen
CREATE OR REPLACE FUNCTION public.update_roadmap_planning_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_compliance_case_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.case_number IS NULL THEN
    NEW.case_number := 'CC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('compliance_case_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_innovation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_article_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Neue Version erstellen bei Inhaltsänderungen
  IF OLD.title != NEW.title OR OLD.content != NEW.content OR OLD.summary != NEW.summary THEN
    INSERT INTO public.knowledge_article_versions (
      article_id, version_number, title, content, summary, created_by
    ) 
    SELECT 
      NEW.id,
      COALESCE(MAX(version_number), 0) + 1,
      NEW.title,
      NEW.content,
      NEW.summary,
      NEW.author_id
    FROM public.knowledge_article_versions 
    WHERE article_id = NEW.id;
  END IF;
  
  -- updated_at aktualisieren
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_incident_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.incident_number IS NULL THEN
    NEW.incident_number := 'INC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('compliance_incident_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_project_activity(p_project_id uuid, p_activity_type text, p_description text, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.project_activities (project_id, user_id, activity_type, description, metadata)
  VALUES (p_project_id, auth.uid(), p_activity_type, p_description, p_metadata)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_approved_absence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Prüfe ob Status zu 'approved' geändert wurde
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    -- Rufe die Edge Function asynchron auf
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

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('ticket_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_absence_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Benachrichtigung bei Statusänderung (Genehmigung/Ablehnung)
  IF OLD.status != NEW.status AND NEW.status IN ('approved', 'rejected') THEN
    -- Überprüfe ob user_id existiert bevor Benachrichtigung erstellt wird
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

CREATE OR REPLACE FUNCTION public.calculate_sla_due_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  sla_hours INTEGER;
BEGIN
  -- Hole SLA-Zeit basierend auf Kategorie und Priorität
  SELECT resolution_time_hours INTO sla_hours
  FROM public.ticket_sla_policies tsp
  WHERE tsp.category_id = NEW.category_id 
    AND tsp.priority = NEW.priority
    AND tsp.is_active = true
  LIMIT 1;
  
  -- Fallback auf Standardwerte
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

CREATE OR REPLACE FUNCTION public.increment_template_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.sync_approved_absence_to_absences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Nur bei Statusänderung zu 'approved' ausführen
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Prüfen ob bereits ein Eintrag in absences existiert
    IF NOT EXISTS (
      SELECT 1 FROM absences 
      WHERE user_id = NEW.user_id 
        AND start_date::date = NEW.start_date 
        AND end_date::date = NEW.end_date
        AND start_time = NEW.start_time
        AND end_time = NEW.end_time
    ) THEN
      -- Neuen Eintrag in absences Tabelle erstellen
      INSERT INTO absences (
        user_id,
        employee_id,
        start_date,
        end_date,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        updated_at
      ) VALUES (
        NEW.user_id,
        NEW.user_id,
        NEW.start_date::timestamp with time zone,
        NEW.end_date::timestamp with time zone,
        NEW.start_time,
        NEW.end_time,
        'approved',
        COALESCE(NEW.reason, 'Genehmigter Abwesenheitsantrag'),
        NOW(),
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_task_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  task_assignee_id UUID;
  task_title TEXT;
  notification_message TEXT;
BEGIN
  -- Hole Task-Details
  SELECT assigned_to, title INTO task_assignee_id, task_title
  FROM public.tasks 
  WHERE id = NEW.id;
  
  -- Nur bei Statusänderungen
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Erstelle Benachrichtigung für den zugewiesenen Benutzer
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
      
      -- Erstelle Employee Task Activity
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
    
    -- Spezielle Behandlung für "done" Status
    IF NEW.status = 'done' THEN
      UPDATE public.tasks 
      SET completed = true, completed_at = NOW()
      WHERE id = NEW.id;
      
      -- Zusätzliche Benachrichtigung für Fertigstellung
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
        
        -- Activity für Fertigstellung
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

CREATE OR REPLACE FUNCTION public.sync_approved_absence_to_calendar_and_shifts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_date_iter DATE;
  shift_conflict_exists BOOLEAN;
BEGIN
  -- Nur bei Statusänderung zu 'approved' ausführen
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- 1. Eintrag in calendar_events für Kalenderanzeige erstellen
    INSERT INTO public.calendar_events (
      title,
      start_time,
      end_time,
      type,
      color,
      description,
      created_by,
      metadata,
      is_all_day
    ) VALUES (
      'Abwesenheit: ' || COALESCE(NEW.employee_name, 'Mitarbeiter'),
      CASE 
        WHEN NEW.half_day AND NEW.start_time IS NOT NULL THEN
          NEW.start_date::timestamp + NEW.start_time::time
        ELSE NEW.start_date::timestamp
      END,
      CASE 
        WHEN NEW.half_day AND NEW.end_time IS NOT NULL THEN
          NEW.start_date::timestamp + NEW.end_time::time
        ELSE NEW.end_date::timestamp + interval '23:59:59'
      END,
      'absence',
      '#EF4444',
      COALESCE('Grund: ' || NEW.reason, 'Genehmigte Abwesenheit'),
      NEW.approved_by,
      jsonb_build_object(
        'absence_request_id', NEW.id,
        'absence_type', NEW.type,
        'employee_id', NEW.user_id,
        'employee_name', NEW.employee_name,
        'department', NEW.department,
        'half_day', NEW.half_day
      ),
      NOT NEW.half_day
    ) ON CONFLICT DO NOTHING;
    
    -- 2. Cross-module Events für Schichtplanung erstellen
    INSERT INTO public.cross_module_events (
      event_type,
      source_module,
      source_id,
      user_id,
      employee_name,
      department,
      start_date,
      end_date,
      start_time,
      end_time,
      status,
      metadata
    ) VALUES (
      'absence',
      'absence',
      NEW.id,
      NEW.user_id,
      COALESCE(NEW.employee_name, 'Unbekannt'),
      COALESCE(NEW.department, 'Unbekannt'),
      NEW.start_date,
      NEW.end_date,
      NEW.start_time,
      NEW.end_time,
      'approved',
      jsonb_build_object(
        'absence_type', NEW.type,
        'reason', NEW.reason,
        'half_day', NEW.half_day,
        'approved_by', NEW.approved_by,
        'approved_at', NEW.approved_at
      )
    ) ON CONFLICT DO NOTHING;
    
    -- 3. Schichtkonflikte identifizieren und markieren
    current_date_iter := NEW.start_date;
    
    WHILE current_date_iter <= NEW.end_date LOOP
      -- Prüfe auf Schichtkonflikte an diesem Tag
      SELECT EXISTS (
        SELECT 1 FROM public.shifts s
        WHERE s.employee_id = NEW.user_id
        AND s.date = current_date_iter
        AND s.status != 'cancelled'
      ) INTO shift_conflict_exists;
      
      -- Wenn Konflikte existieren, markiere sie
      IF shift_conflict_exists THEN
        -- Aktualisiere Schichten als konfliktbehaftet
        UPDATE public.shifts 
        SET 
          status = 'conflict',
          notes = COALESCE(notes || ' | ', '') || 'Konflikt mit genehmigter Abwesenheit vom ' || NEW.start_date::text
        WHERE employee_id = NEW.user_id
        AND date = current_date_iter
        AND status != 'cancelled';
        
        -- Erstelle Konflikt-Event für Benachrichtigungen
        INSERT INTO public.cross_module_events (
          event_type,
          source_module,
          source_id,
          user_id,
          employee_name,
          department,
          start_date,
          end_date,
          status,
          metadata
        ) VALUES (
          'shift_conflict',
          'absence',
          NEW.id,
          NEW.user_id,
          COALESCE(NEW.employee_name, 'Unbekannt'),
          COALESCE(NEW.department, 'Unbekannt'),
          current_date_iter,
          current_date_iter,
          'conflict',
          jsonb_build_object(
            'conflict_type', 'absence_approved',
            'absence_request_id', NEW.id,
            'conflict_date', current_date_iter
          )
        ) ON CONFLICT DO NOTHING;
      END IF;
      
      current_date_iter := current_date_iter + interval '1 day';
    END LOOP;
    
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Bei Fehlern den Trigger nicht stoppen, nur protokollieren
    RAISE NOTICE 'Fehler in sync_approved_absence_to_calendar_and_shifts: %', SQLERRM;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_objective_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.objectives 
  SET 
    progress = (
      SELECT COALESCE(AVG(
        CASE 
          WHEN target_value = 0 THEN 0
          ELSE LEAST(100, (current_value / target_value) * 100)
        END
      ), 0)
      FROM public.key_results 
      WHERE objective_id = COALESCE(NEW.objective_id, OLD.objective_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.objective_id, OLD.objective_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_absence_conflicts_on_shift_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  absence_exists BOOLEAN;
  absence_info RECORD;
BEGIN
  -- Prüfe ob an diesem Tag eine genehmigte Abwesenheit für den Mitarbeiter existiert
  SELECT EXISTS (
    SELECT 1 FROM public.absence_requests ar
    WHERE ar.user_id = NEW.employee_id
    AND ar.status = 'approved'
    AND NEW.date BETWEEN ar.start_date AND ar.end_date
  ) INTO absence_exists;
  
  -- Wenn Abwesenheit existiert, markiere Schicht als Konflikt
  IF absence_exists THEN
    -- Hole Abwesenheitsinformationen für bessere Fehlermeldung
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

CREATE OR REPLACE FUNCTION public.log_objective_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.objective_audit_trail (
      objective_id, action, user_id, user_email, new_value
    ) VALUES (
      NEW.id, 'created', NEW.created_by, 
      (SELECT email FROM auth.users WHERE id = NEW.created_by),
      jsonb_build_object('title', NEW.title, 'status', NEW.status)::text
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log alle relevanten Änderungen
    IF OLD.title != NEW.title THEN
      INSERT INTO public.objective_audit_trail (
        objective_id, action, field_name, old_value, new_value, user_id, user_email
      ) VALUES (
        NEW.id, 'updated', 'title', OLD.title, NEW.title, auth.uid(),
        (SELECT email FROM auth.users WHERE id = auth.uid())
      );
    END IF;
    
    IF OLD.status != NEW.status THEN
      INSERT INTO public.objective_audit_trail (
        objective_id, action, field_name, old_value, new_value, user_id, user_email
      ) VALUES (
        NEW.id, 'updated', 'status', OLD.status, NEW.status, auth.uid(),
        (SELECT email FROM auth.users WHERE id = auth.uid())
      );
    END IF;
    
    NEW.updated_at = now();
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_travel_map_pin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.status = 'approved' THEN
    INSERT INTO public.travel_map_pins (
      travel_request_id,
      destination,
      employee_name,
      travel_dates,
      status,
      risk_level
    ) VALUES (
      NEW.id,
      NEW.destination,
      COALESCE(NEW.employee_name, 'Unbekannt'),
      NEW.start_date::text || ' - ' || NEW.end_date::text,
      NEW.status,
      CASE 
        WHEN NEW.risk_score > 7 THEN 'high'
        WHEN NEW.risk_score > 4 THEN 'medium'
        ELSE 'low'
      END
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_travel_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;