-- Migration 1 (Komplett): Lösche NULL company_id Mitarbeiter + ihre Shifts

-- 1. Trigger-Anpassung (bereits gemacht, aber sicherheitshalber nochmal)
CREATE OR REPLACE FUNCTION public.log_sensitive_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.sensitive_operations_log (
      user_id, operation_type, operation_details, created_at
    ) VALUES (
      auth.uid(), TG_OP,
      jsonb_build_object('table_name', TG_TABLE_NAME, 'record_id', COALESCE(NEW.id, OLD.id)),
      now()
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2. Lösche zuerst alle Shifts von Mitarbeitern mit NULL company_id
DELETE FROM shifts 
WHERE employee_id IN (
  SELECT id FROM employees WHERE company_id IS NULL
);

-- 3. Jetzt können wir die NULL-Mitarbeiter löschen
DELETE FROM employees WHERE company_id IS NULL;

-- 4. Verifizierung
DO $$ 
DECLARE
  null_employees INTEGER;
  orphaned_shifts INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_employees FROM employees WHERE company_id IS NULL;
  SELECT COUNT(*) INTO orphaned_shifts FROM shifts WHERE employee_id IS NULL;
  
  IF null_employees > 0 THEN
    RAISE EXCEPTION 'Es existieren noch % Mitarbeiter mit NULL company_id', null_employees;
  END IF;
  
  RAISE NOTICE '✅ Migration 1 erfolgreich: NULL-Mitarbeiter und ihre Shifts gelöscht';
END $$;