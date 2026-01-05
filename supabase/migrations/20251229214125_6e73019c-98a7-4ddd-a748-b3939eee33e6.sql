-- FIX: Die AKTIV genutzte Funktion sync_cross_module_events() korrigieren
-- Diese Funktion wird von 3 Triggern verwendet, setzte aber company_id NICHT

CREATE OR REPLACE FUNCTION public.sync_cross_module_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_employee_name TEXT;
  v_department TEXT;
  v_start_date DATE;
  v_end_date DATE;
  v_status TEXT;
  v_event_type TEXT;
BEGIN
  -- Event-Type Mapping
  CASE TG_TABLE_NAME
    WHEN 'sick_leaves' THEN v_event_type := 'sick_leave';
    WHEN 'absence_requests' THEN v_event_type := 'absence';
    WHEN 'shifts' THEN v_event_type := 'shift_conflict';
    ELSE v_event_type := 'absence';
  END CASE;

  -- Daten aus Quelltabelle extrahieren (inkl. company_id!)
  IF TG_TABLE_NAME = 'sick_leaves' THEN
    v_user_id := NEW.employee_id;
    v_company_id := NEW.company_id;
    v_start_date := NEW.start_date;
    v_end_date := NEW.end_date;
    v_status := NEW.status;
    
    SELECT first_name || ' ' || last_name, department 
    INTO v_employee_name, v_department
    FROM employees WHERE id = NEW.employee_id;
    
  ELSIF TG_TABLE_NAME = 'absence_requests' THEN
    v_user_id := NEW.user_id;
    v_company_id := NEW.company_id;
    v_start_date := NEW.start_date;
    v_end_date := NEW.end_date;
    v_status := NEW.status;
    v_employee_name := NEW.employee_name;
    v_department := NEW.department;
    
  ELSIF TG_TABLE_NAME = 'shifts' THEN
    v_user_id := NEW.employee_id;
    v_company_id := NEW.company_id;
    v_start_date := NEW.date;
    v_end_date := NEW.date;
    v_status := NEW.status;
    
    SELECT first_name || ' ' || last_name, department 
    INTO v_employee_name, v_department
    FROM employees WHERE id = NEW.employee_id;
  END IF;

  -- Nur einfügen wenn company_id vorhanden
  IF v_company_id IS NULL THEN
    RAISE WARNING 'sync_cross_module_events: company_id NULL für %, skipping', TG_TABLE_NAME;
    RETURN NEW;
  END IF;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.cross_module_events (
      event_type, source_module, source_id, user_id,
      employee_name, department, start_date, end_date, status,
      metadata, company_id
    ) VALUES (
      v_event_type, TG_TABLE_NAME, NEW.id, v_user_id,
      v_employee_name, v_department, v_start_date, v_end_date, v_status,
      jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP),
      v_company_id
    )
    ON CONFLICT (source_module, source_id) DO UPDATE SET
      status = EXCLUDED.status,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      company_id = EXCLUDED.company_id,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;