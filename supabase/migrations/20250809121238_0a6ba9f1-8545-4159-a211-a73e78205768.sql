-- Fix: Trigger korrigieren, damit FK auf absences.user_id nicht verletzt wird
CREATE OR REPLACE FUNCTION public.sync_approved_absence_to_absences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Nur bei Statusänderung zu 'approved' ausführen
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Prüfen ob bereits ein Eintrag existiert (inkl. NULL-safe Vergleich für Zeiten)
    IF NOT EXISTS (
      SELECT 1 FROM absences 
      WHERE employee_id = NEW.user_id 
        AND start_date::date = NEW.start_date 
        AND end_date::date = NEW.end_date
        AND (start_time IS NOT DISTINCT FROM NEW.start_time)
        AND (end_time IS NOT DISTINCT FROM NEW.end_time)
    ) THEN
      -- user_id referenziert auth/profiles → hier nicht setzen, um FK-Konflikte zu vermeiden
      INSERT INTO absences (
        user_id,
        employee_id,
        start_date,
        end_date,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        updated_at
      ) VALUES (
        NULL,
        NEW.user_id,
        NEW.start_date::timestamp with time zone,
        NEW.end_date::timestamp with time zone,
        NEW.start_time,
        NEW.end_time,
        'approved',
        COALESCE(NEW.reason, 'Genehmigter Abwesenheitsantrag'),
        NOW(),
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Test: Pending-Antrag genehmigen, um Trigger zu verifizieren
UPDATE public.absence_requests
SET status = 'approved', approved_by = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2', approved_at = now(), updated_at = now()
WHERE id = 'd1e2f3a4-b5c6-4d7e-8f90-1a2b3c4d5e6f' AND status = 'pending';