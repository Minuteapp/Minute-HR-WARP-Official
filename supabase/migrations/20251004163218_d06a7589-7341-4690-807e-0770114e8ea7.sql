-- NUR DIE 13 FUNKTIONEN MIT search_path VERSEHEN

-- 1. update_sick_leave_employee_data
CREATE OR REPLACE FUNCTION public.update_sick_leave_employee_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT name, department 
  INTO NEW.employee_name, NEW.department
  FROM public.employees 
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- 2. auto_assign_company_id
CREATE OR REPLACE FUNCTION public.auto_assign_company_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.company_id IS NULL AND TG_OP = 'INSERT' THEN
    IF is_in_tenant_context() THEN
      NEW.company_id := get_tenant_company_id_safe();
      RAISE NOTICE 'Tenant mode: Auto-assigned company_id % for table %', NEW.company_id, TG_TABLE_NAME;
    ELSE
      IF NOT is_superadmin_safe(auth.uid()) THEN
        NEW.company_id := get_user_company_id(auth.uid());
        RAISE NOTICE 'Normal mode: Auto-assigned company_id % for table %', NEW.company_id, TG_TABLE_NAME;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. set_tenant_context
CREATE OR REPLACE FUNCTION public.set_tenant_context(tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Benutzer nicht authentifiziert';
  END IF;
  
  PERFORM set_tenant_context_with_user_id(tenant_id, auth.uid());
END;
$$;

-- 4. calculate_objective_progress
CREATE OR REPLACE FUNCTION public.calculate_objective_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 5. log_objective_changes
CREATE OR REPLACE FUNCTION public.log_objective_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- 6. link_absences_to_users
CREATE OR REPLACE FUNCTION public.link_absences_to_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- 7. update_company_employee_count
CREATE OR REPLACE FUNCTION public.update_company_employee_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 8. increment_template_usage
CREATE OR REPLACE FUNCTION public.increment_template_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE public.ticket_templates 
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$;

-- 9. debug_user_context
CREATE OR REPLACE FUNCTION public.debug_user_context()
RETURNS TABLE(current_user_id uuid, user_metadata jsonb, is_super_admin boolean, is_in_tenant_mode boolean, tenant_company_id uuid, user_roles_data jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT
    auth.uid() as current_user_id,
    (SELECT raw_user_meta_data FROM auth.users WHERE id = auth.uid()) as user_metadata,
    is_superadmin_safe(auth.uid()) as is_super_admin,
    is_in_tenant_context() as is_in_tenant_mode,
    get_tenant_company_id_safe() as tenant_company_id,
    (SELECT jsonb_agg(jsonb_build_object('role', role, 'company_id', company_id)) 
     FROM user_roles WHERE user_id = auth.uid()) as user_roles_data;
END;
$$;

-- 10. update_document_approval_status
CREATE OR REPLACE FUNCTION public.update_document_approval_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 11. notify_task_status_change
CREATE OR REPLACE FUNCTION public.notify_task_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  task_assignee_id UUID;
  task_title TEXT;
  notification_message TEXT;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    task_title := NEW.title;
    
    IF NEW.assigned_to IS NOT NULL AND array_length(NEW.assigned_to, 1) > 0 THEN
      FOREACH task_assignee_id IN ARRAY NEW.assigned_to
      LOOP
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
      END LOOP;
    END IF;
    
    IF NEW.status = 'done' THEN
      UPDATE public.tasks 
      SET completed = true, completed_at = NOW()
      WHERE id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 12. update_absence_employee_data
CREATE OR REPLACE FUNCTION public.update_absence_employee_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 13. notify_absence_status_change
CREATE OR REPLACE FUNCTION public.notify_absence_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;