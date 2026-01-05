-- Repariere sync_cross_module_events Funktion für Tabellen ohne employee_id Spalte
CREATE OR REPLACE FUNCTION public.sync_cross_module_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_employee_name TEXT;
  v_department TEXT;
  v_start_date DATE;
  v_end_date DATE;
  v_status TEXT;
BEGIN
  -- Sicher user_id ermitteln (sick_leaves hat nur user_id, nicht employee_id)
  BEGIN
    v_user_id := NEW.user_id;
  EXCEPTION WHEN undefined_column THEN
    BEGIN
      v_user_id := NEW.employee_id;
    EXCEPTION WHEN undefined_column THEN
      v_user_id := NULL;
    END;
  END;

  -- Sicher employee_name ermitteln
  BEGIN
    v_employee_name := NEW.employee_name;
  EXCEPTION WHEN undefined_column THEN
    BEGIN
      v_employee_name := NEW.name;
    EXCEPTION WHEN undefined_column THEN
      v_employee_name := 'Unbekannt';
    END;
  END;

  -- Sicher department ermitteln
  BEGIN
    v_department := NEW.department;
  EXCEPTION WHEN undefined_column THEN
    v_department := 'Unknown';
  END;

  -- Sicher start_date ermitteln
  BEGIN
    v_start_date := NEW.start_date;
  EXCEPTION WHEN undefined_column THEN
    BEGIN
      v_start_date := NEW.date;
    EXCEPTION WHEN undefined_column THEN
      v_start_date := CURRENT_DATE;
    END;
  END;

  -- Sicher end_date ermitteln
  BEGIN
    v_end_date := NEW.end_date;
  EXCEPTION WHEN undefined_column THEN
    v_end_date := v_start_date;
  END;

  -- Sicher status ermitteln
  BEGIN
    v_status := NEW.status::TEXT;
  EXCEPTION WHEN undefined_column THEN
    v_status := 'active';
  END;

  -- Insert in cross_module_events (nur wenn user_id vorhanden)
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
      TG_TABLE_NAME,
      TG_TABLE_NAME,
      NEW.id,
      v_user_id,
      v_employee_name,
      v_department,
      v_start_date,
      v_end_date,
      v_status,
      row_to_json(NEW)::jsonb
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.sync_cross_module_events() IS 'Synchronisiert Events zwischen Modulen - unterstützt Tabellen mit user_id oder employee_id';