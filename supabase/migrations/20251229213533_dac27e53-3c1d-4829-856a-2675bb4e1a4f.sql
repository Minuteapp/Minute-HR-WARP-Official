-- Phase 2: KRITISCHER FIX - sync_to_cross_module_events mit allen Pflichtfeldern
-- Dieser Trigger fehlte company_id, source_id, user_id, start_date, status

CREATE OR REPLACE FUNCTION public.sync_to_cross_module_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_type text;
  v_source_module text;
  v_user_id uuid;
  v_company_id uuid;
  v_start_date date;
  v_end_date date;
  v_status text;
  v_employee_name text;
  v_department text;
  v_source_id uuid;
BEGIN
  -- Map table names to consistent module names
  CASE TG_TABLE_NAME
    WHEN 'absence_requests' THEN v_source_module := 'absence';
    WHEN 'absences' THEN v_source_module := 'absence';
    WHEN 'sick_leaves' THEN v_source_module := 'sick_leave';
    WHEN 'shifts' THEN v_source_module := 'shift_planning';
    WHEN 'time_entries' THEN v_source_module := 'time_tracking';
    WHEN 'employees' THEN v_source_module := 'users_roles';
    WHEN 'documents' THEN v_source_module := 'documents';
    WHEN 'tickets' THEN v_source_module := 'helpdesk';
    WHEN 'applications' THEN v_source_module := 'recruiting';
    WHEN 'onboarding_tasks' THEN v_source_module := 'onboarding';
    WHEN 'offboarding_tasks' THEN v_source_module := 'offboarding';
    WHEN 'workflow_instances' THEN v_source_module := 'workflows';
    WHEN 'training_courses' THEN v_source_module := 'training';
    WHEN 'goals' THEN v_source_module := 'goals';
    WHEN 'performance_reviews' THEN v_source_module := 'performance';
    WHEN 'expense_reports' THEN v_source_module := 'expenses';
    WHEN 'travel_requests' THEN v_source_module := 'business_travel';
    WHEN 'assets' THEN v_source_module := 'assets';
    WHEN 'payroll_runs' THEN v_source_module := 'payroll';
    ELSE v_source_module := TG_TABLE_NAME;
  END CASE;

  -- Determine event type and extract data based on operation
  IF TG_OP = 'DELETE' THEN
    v_event_type := v_source_module || '_deleted';
    v_source_id := OLD.id;
    v_user_id := COALESCE(OLD.user_id, OLD.employee_id, auth.uid());
    v_company_id := OLD.company_id;
    v_start_date := COALESCE(OLD.start_date::date, CURRENT_DATE);
    v_end_date := OLD.end_date::date;
    v_status := 'deleted';
  ELSE
    IF TG_OP = 'INSERT' THEN
      v_event_type := v_source_module || '_created';
    ELSE
      v_event_type := v_source_module || '_updated';
    END IF;
    
    v_source_id := NEW.id;
    v_user_id := COALESCE(NEW.user_id, NEW.employee_id, auth.uid());
    v_company_id := NEW.company_id;
    v_start_date := COALESCE(NEW.start_date::date, CURRENT_DATE);
    v_end_date := NEW.end_date::date;
    v_status := COALESCE(NEW.status, 'active');
  END IF;

  -- Nur einfügen wenn company_id vorhanden - sonst Skip mit Warning
  IF v_company_id IS NULL THEN
    RAISE WARNING 'sync_to_cross_module_events: company_id is NULL for table %, skipping event', TG_TABLE_NAME;
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Hole Employee-Info wenn möglich
  BEGIN
    SELECT 
      COALESCE(e.first_name || ' ' || e.last_name, p.full_name),
      e.department
    INTO v_employee_name, v_department
    FROM public.employees e
    LEFT JOIN public.profiles p ON p.id = v_user_id
    WHERE e.user_id = v_user_id AND e.company_id = v_company_id
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_employee_name := NULL;
    v_department := NULL;
  END;

  -- Insert into cross_module_events mit allen Pflichtfeldern
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
    metadata,
    company_id,
    created_at
  ) VALUES (
    v_event_type,
    v_source_module,
    v_source_id,
    v_user_id,
    v_employee_name,
    v_department,
    v_start_date,
    v_end_date,
    v_status,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END,
    v_company_id,
    now()
  )
  ON CONFLICT (source_module, source_id) DO UPDATE SET
    event_type = EXCLUDED.event_type,
    status = EXCLUDED.status,
    end_date = EXCLUDED.end_date,
    metadata = EXCLUDED.metadata,
    updated_at = now();

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;