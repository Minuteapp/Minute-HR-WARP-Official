-- SICHERHEITSREPARATUR TEIL 4: Letzte 4 Funktionen härten

-- 1. sync_approved_absence_to_calendar_and_shifts
CREATE OR REPLACE FUNCTION public.sync_approved_absence_to_calendar_and_shifts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_date_iter DATE;
  shift_conflict_exists BOOLEAN;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
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
    
    current_date_iter := NEW.start_date;
    
    WHILE current_date_iter <= NEW.end_date LOOP
      SELECT EXISTS (
        SELECT 1 FROM public.shifts s
        WHERE s.employee_id = NEW.user_id
        AND s.date = current_date_iter
        AND s.status != 'cancelled'
      ) INTO shift_conflict_exists;
      
      IF shift_conflict_exists THEN
        UPDATE public.shifts 
        SET 
          status = 'conflict',
          notes = COALESCE(notes || ' | ', '') || 'Konflikt mit genehmigter Abwesenheit vom ' || NEW.start_date::text
        WHERE employee_id = NEW.user_id
        AND date = current_date_iter
        AND status != 'cancelled';
        
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
    RAISE NOTICE 'Fehler in sync_approved_absence_to_calendar_and_shifts: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- 2. calculate_objective_progress
CREATE OR REPLACE FUNCTION public.calculate_objective_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 3. log_objective_changes
CREATE OR REPLACE FUNCTION public.log_objective_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 4. create_travel_map_pin
CREATE OR REPLACE FUNCTION public.create_travel_map_pin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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