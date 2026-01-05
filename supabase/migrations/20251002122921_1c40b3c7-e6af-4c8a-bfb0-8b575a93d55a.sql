-- VOLLSTÄNDIGE FUNKTIONSHÄRTUNG: Alle 15 verbleibenden Funktionen

-- 1. create_recruiting_reminder
CREATE OR REPLACE FUNCTION public.create_recruiting_reminder()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    IF NEW.status = 'applied' AND NEW.current_stage = 'review' THEN
        INSERT INTO public.recruiting_reminders (
            application_id, 
            reminder_type, 
            due_date, 
            assigned_to, 
            message
        ) VALUES (
            NEW.id,
            'application_review',
            NEW.submitted_at + INTERVAL '7 days',
            NEW.assigned_to,
            'Diese Bewerbung wurde seit 7 Tagen nicht überprüft'
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 2. update_innovation_updated_at
CREATE OR REPLACE FUNCTION public.update_innovation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. create_article_version
CREATE OR REPLACE FUNCTION public.create_article_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
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
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 4. generate_incident_number
CREATE OR REPLACE FUNCTION public.generate_incident_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.incident_number IS NULL THEN
    NEW.incident_number := 'INC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('compliance_incident_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- 5. generate_ticket_number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('ticket_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- 6. update_roadmap_planning_updated_at
CREATE OR REPLACE FUNCTION public.update_roadmap_planning_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 7. log_employee_action
CREATE OR REPLACE FUNCTION public.log_employee_action(_employee_id uuid, _action_type text, _details jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.employee_audit_logs (employee_id, action_type, performed_by, details)
    VALUES (_employee_id, _action_type, auth.uid(), _details);
END;
$function$;

-- 8. generate_compliance_case_number
CREATE OR REPLACE FUNCTION public.generate_compliance_case_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.case_number IS NULL THEN
    NEW.case_number := 'CC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('compliance_case_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- 9. generate_abwesenheitsantrag_number
CREATE OR REPLACE FUNCTION public.generate_abwesenheitsantrag_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.antrag_nummer IS NULL THEN
    NEW.antrag_nummer := 'AB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('abwesenheitsantrag_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- 10. bulk_update_employee_status
CREATE OR REPLACE FUNCTION public.bulk_update_employee_status(p_employee_ids uuid[], p_new_status text, p_updated_by uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  updated_count integer;
BEGIN
  UPDATE employees 
  SET status = p_new_status, 
      updated_at = now()
  WHERE id = ANY(p_employee_ids);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$function$;

-- 11. update_travel_updated_at
CREATE OR REPLACE FUNCTION public.update_travel_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 12. enqueue_eu_for_ocr
CREATE OR REPLACE FUNCTION public.enqueue_eu_for_ocr()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.ocr_queue (document_id, status, created_at)
  VALUES (NEW.id, 'pending', now())
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- 13. create_employee_without_company_id
CREATE OR REPLACE FUNCTION public.create_employee_without_company_id(
  p_name text, 
  p_first_name text, 
  p_last_name text, 
  p_email text, 
  p_employee_number text, 
  p_department text, 
  p_position text, 
  p_team text, 
  p_employment_type text, 
  p_start_date date, 
  p_onboarding_required boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_employee_id uuid;
BEGIN
  INSERT INTO employees (
    name, status, first_name, last_name, email,
    employee_number, department, position, team,
    employment_type, start_date, onboarding_required
  ) VALUES (
    p_name, 'active', p_first_name, p_last_name, p_email,
    p_employee_number, p_department, p_position, p_team,
    p_employment_type::employment_type, p_start_date, p_onboarding_required
  ) RETURNING id INTO v_employee_id;
  
  RETURN v_employee_id;
END;
$function$;

-- 14. get_employees_with_company
CREATE OR REPLACE FUNCTION public.get_employees_with_company()
RETURNS TABLE(
  id uuid, 
  name text, 
  first_name text, 
  last_name text, 
  email text, 
  employee_number text, 
  department text, 
  "position" text, 
  team text, 
  employment_type employment_type, 
  start_date date, 
  status text, 
  company_id uuid, 
  company_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT * FROM public.get_employee_company_data();
END;
$function$;

-- 15. deactivate_company
CREATE OR REPLACE FUNCTION public.deactivate_company(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE companies
  SET is_active = false
  WHERE id = p_company_id;
END;
$function$;