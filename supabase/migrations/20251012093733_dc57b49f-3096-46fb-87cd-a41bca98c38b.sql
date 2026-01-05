-- Migration 3: NOT NULL Constraint auf company_id setzen

-- 1. Finale Prüfung: Gibt es noch NULL company_id Werte?
DO $$ 
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count 
  FROM employees 
  WHERE company_id IS NULL;
  
  IF null_count > 0 THEN
    RAISE EXCEPTION 'Es existieren noch % Mitarbeiter mit company_id = NULL. Migration 1 wurde nicht korrekt ausgeführt!', null_count;
  END IF;
  
  RAISE NOTICE '✅ Keine NULL company_id Werte gefunden, fahre fort mit NOT NULL Constraint';
END $$;

-- 2. Setze NOT NULL Constraint auf company_id
ALTER TABLE employees 
ALTER COLUMN company_id SET NOT NULL;

-- 3. Kommentar zur Spalte
COMMENT ON COLUMN employees.company_id IS 
'Pflichtfeld: Jeder Mitarbeiter MUSS einer Firma zugeordnet sein. 
Der Trigger set_company_id_from_context() setzt automatisch die company_id beim INSERT.';

-- 4. Verifizierung
DO $$
BEGIN
  -- Prüfe ob NOT NULL Constraint aktiv ist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' 
    AND column_name = 'company_id' 
    AND is_nullable = 'NO'
  ) THEN
    RAISE NOTICE '✅ NOT NULL Constraint erfolgreich gesetzt auf employees.company_id';
  ELSE
    RAISE EXCEPTION 'NOT NULL Constraint konnte nicht gesetzt werden!';
  END IF;
END $$;