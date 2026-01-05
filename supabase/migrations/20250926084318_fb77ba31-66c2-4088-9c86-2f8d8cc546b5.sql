-- SICHERHEITSREPARATUR TEIL 12: Update/Calendar/Dashboard Funktionen härten
-- Batch 2: Update Funktionen aus Screenshot

-- update_absence_employee_data Funktion härten
CREATE OR REPLACE FUNCTION public.update_absence_employee_data()
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

-- update_dashboard_updated_at Funktion härten  
CREATE OR REPLACE FUNCTION public.update_dashboard_updated_at()
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

-- update_document_approval_status Funktion härten
CREATE OR REPLACE FUNCTION public.update_document_approval_status()
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

-- update_document_templates_updated_at Funktion härten
CREATE OR REPLACE FUNCTION public.update_document_templates_updated_at()
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

-- update_forecast_updated_at Funktion härten
CREATE OR REPLACE FUNCTION public.update_forecast_updated_at()
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

-- update_goal_templates_updated_at Funktion härten
CREATE OR REPLACE FUNCTION public.update_goal_templates_updated_at()
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