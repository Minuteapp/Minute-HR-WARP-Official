-- Fix trigger functions to handle assigned_to as UUID array

-- 1. Fix trigger_task_assigned_notification
CREATE OR REPLACE FUNCTION public.trigger_task_assigned_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id UUID;
  v_assignee_id UUID;
BEGIN
  -- Prüfen ob assigned_to ein nicht-leeres Array ist und sich geändert hat
  IF NEW.assigned_to IS NOT NULL 
     AND array_length(NEW.assigned_to, 1) > 0 
     AND (OLD.assigned_to IS NULL OR OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
    
    -- Für jeden zugewiesenen Benutzer eine Notification erstellen
    FOREACH v_assignee_id IN ARRAY NEW.assigned_to
    LOOP
      -- Company ID ermitteln
      SELECT company_id INTO v_company_id
      FROM public.employees
      WHERE id = v_assignee_id
      LIMIT 1;
      
      -- Notification erstellen
      PERFORM create_unified_notification(
        p_user_id := v_assignee_id,
        p_source_module := 'tasks',
        p_source_id := NEW.id,
        p_source_table := 'tasks',
        p_notification_type := 'task_assigned',
        p_title := '📋 Neue Aufgabe zugewiesen',
        p_message := format('Sie wurden der Aufgabe "%s" zugewiesen', NEW.title),
        p_priority := CASE 
          WHEN NEW.priority = 'urgent' THEN 'critical'
          WHEN NEW.priority = 'high' THEN 'high'
          ELSE 'medium'
        END,
        p_action_url := '/tasks/' || NEW.id::text,
        p_metadata := jsonb_build_object(
          'task_id', NEW.id,
          'task_title', NEW.title,
          'task_priority', NEW.priority,
          'assigned_by', NEW.created_by
        ),
        p_company_id := v_company_id
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Fix trigger_task_status_changed_notification
CREATE OR REPLACE FUNCTION public.trigger_task_status_changed_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id UUID;
  v_creator_id UUID;
BEGIN
  -- Status-Änderungs-Notification
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Company ID ermitteln (vom ersten Assignee wenn vorhanden)
    IF NEW.assigned_to IS NOT NULL AND array_length(NEW.assigned_to, 1) > 0 THEN
      SELECT company_id INTO v_company_id
      FROM public.employees
      WHERE id = NEW.assigned_to[1]
      LIMIT 1;
    END IF;
    
    -- Notification an Ersteller (wenn nicht selbst)
    v_creator_id := NEW.created_by;
    
    IF v_creator_id IS NOT NULL AND v_creator_id != auth.uid() THEN
      PERFORM create_unified_notification(
        p_user_id := v_creator_id,
        p_source_module := 'tasks',
        p_source_id := NEW.id,
        p_source_table := 'tasks',
        p_notification_type := 'task_status_changed',
        p_title := '🔄 Task-Status aktualisiert',
        p_message := format('Status der Aufgabe "%s" wurde geändert: %s → %s', 
          NEW.title, OLD.status, NEW.status),
        p_priority := 'medium',
        p_action_url := '/tasks/' || NEW.id::text,
        p_metadata := jsonb_build_object(
          'task_id', NEW.id,
          'task_title', NEW.title,
          'old_status', OLD.status,
          'new_status', NEW.status,
          'changed_by', auth.uid()
        ),
        p_company_id := v_company_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Check if trigger_task_completed_notification exists and fix it
CREATE OR REPLACE FUNCTION public.trigger_task_completed_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id UUID;
  v_assignee_id UUID;
BEGIN
  -- Nur bei Status-Wechsel zu 'completed' oder 'done'
  IF NEW.status IN ('completed', 'done') AND OLD.status NOT IN ('completed', 'done') THEN
    -- Company ID ermitteln
    IF NEW.assigned_to IS NOT NULL AND array_length(NEW.assigned_to, 1) > 0 THEN
      SELECT company_id INTO v_company_id
      FROM public.employees
      WHERE id = NEW.assigned_to[1]
      LIMIT 1;
    END IF;
    
    -- Notification an Ersteller wenn vorhanden
    IF NEW.created_by IS NOT NULL AND NEW.created_by != auth.uid() THEN
      PERFORM create_unified_notification(
        p_user_id := NEW.created_by,
        p_source_module := 'tasks',
        p_source_id := NEW.id,
        p_source_table := 'tasks',
        p_notification_type := 'task_completed',
        p_title := '✅ Aufgabe abgeschlossen',
        p_message := format('Die Aufgabe "%s" wurde abgeschlossen', NEW.title),
        p_priority := 'low',
        p_action_url := '/tasks/' || NEW.id::text,
        p_metadata := jsonb_build_object(
          'task_id', NEW.id,
          'task_title', NEW.title,
          'completed_by', auth.uid()
        ),
        p_company_id := v_company_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;