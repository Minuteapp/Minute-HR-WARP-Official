-- SICHERHEITSREPARATUR TEIL 11: Weitere kritische Funktionen reparieren
-- Funktionen vom Screenshot härten

-- increment_template_usage Funktion härten
CREATE OR REPLACE FUNCTION public.increment_template_usage()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE public.ticket_templates 
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- set_updated_at Funktion härten
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- update_updated_at_column Funktion härten
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;