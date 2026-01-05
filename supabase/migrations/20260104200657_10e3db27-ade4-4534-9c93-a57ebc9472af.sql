-- Fix: sync_cross_module_events Trigger verwendet falsches Feld für sick_leaves
-- Ersetze employee_id mit user_id für die sick_leaves Tabelle

CREATE OR REPLACE FUNCTION sync_cross_module_events()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
  v_user_id UUID;
  v_company_id UUID;
  v_employee_name TEXT;
  v_department TEXT;
  v_start_date DATE;
  v_end_date DATE;
  v_status TEXT;
  v_metadata JSONB;
BEGIN
  -- Event-Type basierend auf Tabelle setzen
  CASE TG_TABLE_NAME
    WHEN 'sick_leaves' THEN v_event_type := 'sick_leave';
    WHEN 'absence_requests' THEN v_event_type := 'absence';
    WHEN 'vacation_requests' THEN v_event_type := 'vacation';
    ELSE v_event_type := TG_TABLE_NAME;
  END CASE;

  -- Daten aus Quelltabelle extrahieren
  IF TG_TABLE_NAME = 'sick_leaves' THEN
    -- KORREKTUR: Verwende user_id statt employee_id
    v_user_id := NEW.user_id;
    v_company_id := NEW.company_id;
    v_start_date := NEW.start_date;
    v_end_date := NEW.end_date;
    v_status := NEW.status;
    v_employee_name := NEW.employee_name;
    v_department := NEW.department;
    
    -- Hole Employee-Daten aus employees Tabelle basierend auf user_id falls nicht vorhanden
    IF v_employee_name IS NULL THEN
      SELECT first_name || ' ' || last_name, department 
      INTO v_employee_name, v_department
      FROM employees WHERE user_id = NEW.user_id;
    END IF;
    
    v_metadata := jsonb_build_object(
      'source_table', 'sick_leaves',
      'source_id', NEW.id,
      'sick_leave_type', NEW.sick_leave_type,
      'certificate_submitted', NEW.certificate_submitted
    );
    
  ELSIF TG_TABLE_NAME = 'absence_requests' THEN
    v_user_id := NEW.user_id;
    v_company_id := NEW.company_id;
    v_start_date := NEW.start_date;
    v_end_date := NEW.end_date;
    v_status := NEW.status;
    v_employee_name := NEW.employee_name;
    v_department := NEW.department;
    
    v_metadata := jsonb_build_object(
      'source_table', 'absence_requests',
      'source_id', NEW.id,
      'absence_type', NEW.absence_type,
      'type', NEW.type
    );
    
  ELSIF TG_TABLE_NAME = 'vacation_requests' THEN
    v_user_id := NEW.user_id;
    v_company_id := NEW.company_id;
    v_start_date := NEW.start_date;
    v_end_date := NEW.end_date;
    v_status := NEW.status;
    
    -- Hole Employee-Daten aus employees Tabelle
    SELECT first_name || ' ' || last_name, department 
    INTO v_employee_name, v_department
    FROM employees WHERE user_id = NEW.user_id;
    
    v_metadata := jsonb_build_object(
      'source_table', 'vacation_requests',
      'source_id', NEW.id
    );
  ELSE
    -- Für andere Tabellen: Standard-Mapping versuchen
    v_user_id := NEW.user_id;
    v_company_id := NEW.company_id;
    v_start_date := COALESCE(NEW.start_date, CURRENT_DATE);
    v_end_date := COALESCE(NEW.end_date, CURRENT_DATE);
    v_status := COALESCE(NEW.status, 'pending');
    
    v_metadata := jsonb_build_object(
      'source_table', TG_TABLE_NAME,
      'source_id', NEW.id
    );
  END IF;

  -- Event in cross_module_events einfügen
  INSERT INTO cross_module_events (
    company_id,
    user_id,
    event_type,
    source_module,
    source_id,
    employee_name,
    department,
    start_date,
    end_date,
    status,
    metadata
  ) VALUES (
    v_company_id,
    v_user_id,
    v_event_type,
    TG_TABLE_NAME,
    NEW.id,
    v_employee_name,
    v_department,
    v_start_date,
    v_end_date,
    v_status,
    v_metadata
  )
  ON CONFLICT (source_module, source_id) 
  DO UPDATE SET
    status = EXCLUDED.status,
    end_date = EXCLUDED.end_date,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Bei Fehlern loggen aber nicht abbrechen
    RAISE WARNING 'sync_cross_module_events error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;