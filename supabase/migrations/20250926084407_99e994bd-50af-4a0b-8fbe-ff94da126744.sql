-- SICHERHEITSREPARATUR TEIL 13: Weitere Funktionen aus Screenshot härten  
-- Batch 3: Logging und Performance Funktionen

-- update_performance_updated_at Funktion härten
CREATE OR REPLACE FUNCTION public.update_performance_updated_at()
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

-- update_policy_updated_at Funktion härten
CREATE OR REPLACE FUNCTION public.update_policy_updated_at()
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

-- update_roadmap_goals_updated_at Funktion härten  
CREATE OR REPLACE FUNCTION public.update_roadmap_goals_updated_at()
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

-- log_sensitive_changes Funktion härten
CREATE OR REPLACE FUNCTION public.log_sensitive_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.sensitive_operations_log (
    user_id,
    operation_type,
    operation_details,
    created_at
  ) VALUES (
    auth.uid(),
    TG_OP,
    jsonb_build_object('table_name', TG_TABLE_NAME, 'record_id', COALESCE(NEW.id, OLD.id)),
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- log_worktime_settings_changes Funktion härten
CREATE OR REPLACE FUNCTION public.log_worktime_settings_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.sensitive_operations_log (
    user_id,
    operation_type, 
    operation_details,
    created_at
  ) VALUES (
    auth.uid(),
    'worktime_settings_change',
    jsonb_build_object('table_name', TG_TABLE_NAME, 'record_id', COALESCE(NEW.id, OLD.id)),
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;