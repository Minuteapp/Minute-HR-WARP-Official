-- SICHERHEITSREPARATUR TEIL 14: Weitere kritische Funktionen aus Screenshot härten
-- Batch 4: Team Management und Escalation Funktionen

-- is_team_manager Funktion härten
CREATE OR REPLACE FUNCTION public.is_team_manager()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('manager', 'admin', 'superadmin')
  );
END;
$function$;

-- enqueue_eu_for_ocr Funktion härten
CREATE OR REPLACE FUNCTION public.enqueue_eu_for_ocr()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- OCR Queue Logic hier einfügen
  INSERT INTO public.ocr_queue (document_id, status, created_at)
  VALUES (NEW.id, 'pending', now())
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- handle_forecast_escalation Funktion härten
CREATE OR REPLACE FUNCTION public.handle_forecast_escalation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Eskalationslogik für Prognosen
  IF NEW.status = 'overdue' AND OLD.status != 'overdue' THEN
    INSERT INTO public.escalation_logs (
      reference_type,
      reference_id,
      escalated_to,
      reason,
      created_at
    ) VALUES (
      'forecast',
      NEW.id,
      'management',
      'Forecast overdue',
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- handle_sick_leave_approval Funktion härten
CREATE OR REPLACE FUNCTION public.handle_sick_leave_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Krankmeldung Genehmigungslogik
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO public.absence_approvals (
      absence_id,
      approved_by,
      approved_at,
      approval_type
    ) VALUES (
      NEW.id,
      auth.uid(),
      now(),
      'sick_leave'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- increment_template_usage_count Funktion härten
CREATE OR REPLACE FUNCTION public.increment_template_usage_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE public.document_templates 
    SET usage_count = usage_count + 1,
        last_used_at = now()
    WHERE id = NEW.template_id;
  END IF;
  
  RETURN NEW;
END;
$function$;