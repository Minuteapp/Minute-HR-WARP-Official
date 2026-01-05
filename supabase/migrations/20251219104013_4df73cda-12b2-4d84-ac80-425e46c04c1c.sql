-- Korrigiere die sync_cross_module_events Funktion, um den event_type korrekt zu mappen
CREATE OR REPLACE FUNCTION public.sync_cross_module_events()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_employee_name TEXT;
  v_department TEXT;
  v_start_date DATE;
  v_end_date DATE;
  v_status TEXT;
  v_event_type TEXT;
BEGIN
  -- Tabellennamen zu erlaubtem event_type mappen
  CASE TG_TABLE_NAME
    WHEN 'sick_leaves' THEN v_event_type := 'sick_leave';
    WHEN 'absence_requests' THEN v_event_type := 'absence';
    WHEN 'shifts' THEN v_event_type := 'shift_conflict';
    ELSE v_event_type := 'absence';
  END CASE;

  -- Daten basierend auf der Quelltabelle extrahieren
  IF TG_TABLE_NAME = 'sick_leaves' THEN
    v_user_id := NEW.employee_id;
    v_start_date := NEW.start_date;
    v_end_date := NEW.end_date;
    v_status := NEW.status;
    
    SELECT first_name || ' ' || last_name, department 
    INTO v_employee_name, v_department
    FROM employees WHERE id = NEW.employee_id;
    
  ELSIF TG_TABLE_NAME = 'absence_requests' THEN
    v_user_id := NEW.user_id;
    v_start_date := NEW.start_date;
    v_end_date := NEW.end_date;
    v_status := NEW.status;
    v_employee_name := NEW.employee_name;
    v_department := NEW.department;
    
  ELSIF TG_TABLE_NAME = 'shifts' THEN
    v_user_id := NEW.employee_id;
    v_start_date := NEW.date;
    v_end_date := NEW.date;
    v_status := NEW.status;
    
    SELECT first_name || ' ' || last_name, department 
    INTO v_employee_name, v_department
    FROM employees WHERE id = NEW.employee_id;
  END IF;

  -- Event in cross_module_events einfügen
  IF v_user_id IS NOT NULL THEN
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
      v_event_type,
      TG_TABLE_NAME,
      NEW.id,
      v_user_id,
      v_employee_name,
      v_department,
      v_start_date,
      v_end_date,
      v_status,
      jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)
    )
    ON CONFLICT (source_module, source_id) 
    DO UPDATE SET
      status = EXCLUDED.status,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;