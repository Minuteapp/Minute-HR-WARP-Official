-- Phase 1 & 2: Automatische company_id Zuweisung + Datenmigration

-- ============================================
-- Phase 1: Master-Trigger-Funktion erstellen
-- ============================================

CREATE OR REPLACE FUNCTION public.set_company_id_from_context()
RETURNS TRIGGER AS $$
BEGIN
  -- Wenn company_id bereits gesetzt ist, nichts tun
  IF NEW.company_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Setze company_id auf get_effective_company_id()
  NEW.company_id := get_effective_company_id();
  
  -- Falls auch das NULL ist (Superadmin ohne Tenant), Fehler werfen
  IF NEW.company_id IS NULL THEN
    RAISE EXCEPTION 'company_id kann nicht NULL sein. Bitte in Tenant-Modus wechseln oder company_id explizit setzen.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- Trigger auf kritische Tabellen anwenden
-- ============================================

-- 1. Employees
DROP TRIGGER IF EXISTS set_employees_company_id ON employees;
CREATE TRIGGER set_employees_company_id
  BEFORE INSERT ON employees
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_context();

-- 2. Absence Requests
DROP TRIGGER IF EXISTS set_absence_requests_company_id ON absence_requests;
CREATE TRIGGER set_absence_requests_company_id
  BEFORE INSERT ON absence_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_context();

-- 3. Calendar Events
DROP TRIGGER IF EXISTS set_calendar_events_company_id ON calendar_events;
CREATE TRIGGER set_calendar_events_company_id
  BEFORE INSERT ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_context();

-- 4. Projects
DROP TRIGGER IF EXISTS set_projects_company_id ON projects;
CREATE TRIGGER set_projects_company_id
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_context();

-- 5. Tasks
DROP TRIGGER IF EXISTS set_tasks_company_id ON tasks;
CREATE TRIGGER set_tasks_company_id
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_context();

-- 6. Goals
DROP TRIGGER IF EXISTS set_goals_company_id ON goals;
CREATE TRIGGER set_goals_company_id
  BEFORE INSERT ON goals
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_context();

-- 7. Business Trips
DROP TRIGGER IF EXISTS set_business_trips_company_id ON business_trips;
CREATE TRIGGER set_business_trips_company_id
  BEFORE INSERT ON business_trips
  FOR EACH ROW
  EXECUTE FUNCTION set_company_id_from_context();

-- ============================================
-- Phase 2: Bestehende NULL-Werte korrigieren
-- ============================================

-- 2.1 Employees: Zuordnung basierend auf user_roles
UPDATE employees e
SET company_id = (
  SELECT ur.company_id 
  FROM user_roles ur 
  WHERE ur.user_id = e.id 
  LIMIT 1
)
WHERE e.company_id IS NULL
  AND EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = e.id 
    AND ur.company_id IS NOT NULL
  );

-- 2.2 Log: Anzahl der korrigierten Datensätze
DO $$
DECLARE
  remaining_nulls INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_nulls 
  FROM employees 
  WHERE company_id IS NULL;
  
  RAISE NOTICE 'Migration abgeschlossen. Verbleibende NULL company_ids in employees: %', remaining_nulls;
END $$;