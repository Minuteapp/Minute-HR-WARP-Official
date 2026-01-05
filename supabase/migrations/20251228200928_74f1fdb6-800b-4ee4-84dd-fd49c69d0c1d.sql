-- 1. Trigger-Funktion aktualisieren: Modul-Namen statt Tabellennamen
CREATE OR REPLACE FUNCTION public.sync_to_cross_module_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_type text;
  v_source_module text;
  v_related_entity_type text;
  v_related_entity_id uuid;
  v_metadata jsonb;
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

  -- Determine event type based on operation
  IF TG_OP = 'INSERT' THEN
    v_event_type := v_source_module || '_created';
  ELSIF TG_OP = 'UPDATE' THEN
    v_event_type := v_source_module || '_updated';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := v_source_module || '_deleted';
  END IF;

  -- Set related entity info
  v_related_entity_type := TG_TABLE_NAME;
  
  IF TG_OP = 'DELETE' THEN
    v_related_entity_id := OLD.id;
    v_metadata := to_jsonb(OLD);
  ELSE
    v_related_entity_id := NEW.id;
    v_metadata := to_jsonb(NEW);
  END IF;

  -- Insert into cross_module_events
  INSERT INTO public.cross_module_events (
    event_type,
    source_module,
    related_entity_type,
    related_entity_id,
    metadata,
    created_at
  ) VALUES (
    v_event_type,
    v_source_module,
    v_related_entity_type,
    v_related_entity_id,
    v_metadata,
    now()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- 2. Check-Constraint erweitern (Tabellennamen als Fallback)
ALTER TABLE public.cross_module_events 
DROP CONSTRAINT IF EXISTS cross_module_events_source_module_check;

ALTER TABLE public.cross_module_events 
ADD CONSTRAINT cross_module_events_source_module_check 
CHECK (source_module = ANY (ARRAY[
  -- Modul-Namen
  'absence', 'sick_leave', 'shift_planning', 'recruiting', 'onboarding', 
  'offboarding', 'performance', 'payroll', 'expenses', 'assets', 
  'workflows', 'projects', 'documents', 'helpdesk', 'orgchart', 
  'users_roles', 'notifications', 'innovation', 'knowledge', 'rewards', 
  'workforce_planning', 'global_mobility', 'compliance', 'time_tracking', 
  'calendar', 'business_travel', 'training', 'goals', 'chat', 'ai', 
  'settings', 'dashboard', 'reports', 'analytics', 'integrations', 
  'security', 'audit',
  -- Tabellen-Namen (Fallback für Kompatibilität)
  'absence_requests', 'absences', 'sick_leaves', 'shifts', 'time_entries',
  'employees', 'tickets', 'applications', 'onboarding_tasks', 'offboarding_tasks',
  'workflow_instances', 'training_courses', 'performance_reviews', 'expense_reports',
  'travel_requests', 'payroll_runs'
]));

-- 3. Bestehende Daten migrieren (Tabellennamen → Modul-Namen)
UPDATE public.cross_module_events SET source_module = 'absence' WHERE source_module = 'absence_requests';
UPDATE public.cross_module_events SET source_module = 'absence' WHERE source_module = 'absences';
UPDATE public.cross_module_events SET source_module = 'sick_leave' WHERE source_module = 'sick_leaves';
UPDATE public.cross_module_events SET source_module = 'shift_planning' WHERE source_module = 'shifts';
UPDATE public.cross_module_events SET source_module = 'time_tracking' WHERE source_module = 'time_entries';