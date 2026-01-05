-- Trigger-Funktion reparieren: is_active durch status = 'active' ersetzen
CREATE OR REPLACE FUNCTION public.check_employee_duplicate_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.employees
    WHERE company_id = NEW.company_id
      AND LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status = 'active'
      AND archived = false
  ) THEN
    RAISE EXCEPTION 'Ein Mitarbeiter mit dieser E-Mail-Adresse existiert bereits.';
  END IF;
  RETURN NEW;
END;
$function$;