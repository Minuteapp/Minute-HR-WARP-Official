
-- Trigger-Funktion für die automatische Synchronisation genehmigter Abwesenheitsanträge
CREATE OR REPLACE FUNCTION public.sync_approved_absence_to_calendar_and_shifts()
RETURNS TRIGGER AS $$
DECLARE
  current_date_iter DATE;
  shift_conflict_exists BOOLEAN;
BEGIN
  -- Nur bei Statusänderung zu 'approved' ausführen
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- 1. Eintrag in calendar_events für Kalenderanzeige erstellen
    INSERT INTO public.calendar_events (
      title,
      start_time,
      end_time,
      type,
      color,
      description,
      created_by,
      metadata,
      is_all_day
    ) VALUES (
      'Abwesenheit: ' || COALESCE(NEW.employee_name, 'Mitarbeiter'),
      CASE 
        WHEN NEW.half_day AND NEW.start_time IS NOT NULL THEN
          NEW.start_date::timestamp + NEW.start_time::time
        ELSE NEW.start_date::timestamp
      END,
      CASE 
        WHEN NEW.half_day AND NEW.end_time IS NOT NULL THEN
          NEW.start_date::timestamp + NEW.end_time::time
        ELSE NEW.end_date::timestamp + interval '23:59:59'
      END,
      'absence',
      '#EF4444',
      COALESCE('Grund: ' || NEW.reason, 'Genehmigte Abwesenheit'),
      NEW.approved_by,
      jsonb_build_object(
        'absence_request_id', NEW.id,
        'absence_type', NEW.type,
        'employee_id', NEW.user_id,
        'employee_name', NEW.employee_name,
        'department', NEW.department,
        'half_day', NEW.half_day
      ),
      NOT NEW.half_day
    ) ON CONFLICT DO NOTHING;
    
    -- 2. Cross-module Events für Schichtplanung erstellen
    INSERT INTO public.cross_module_events (
      event_type,
      source_module,
      source_id,
      user_id,
      employee_name,
      department,
      start_date,
      end_date,
      start_time,
      end_time,
      status,
      metadata
    ) VALUES (
      'absence',
      'absence',
      NEW.id,
      NEW.user_id,
      COALESCE(NEW.employee_name, 'Unbekannt'),
      COALESCE(NEW.department, 'Unbekannt'),
      NEW.start_date,
      NEW.end_date,
      NEW.start_time,
      NEW.end_time,
      'approved',
      jsonb_build_object(
        'absence_type', NEW.type,
        'reason', NEW.reason,
        'half_day', NEW.half_day,
        'approved_by', NEW.approved_by,
        'approved_at', NEW.approved_at
      )
    ) ON CONFLICT DO NOTHING;
    
    -- 3. Schichtkonflikte identifizieren und markieren
    current_date_iter := NEW.start_date;
    
    WHILE current_date_iter <= NEW.end_date LOOP
      -- Prüfe auf Schichtkonflikte an diesem Tag
      SELECT EXISTS (
        SELECT 1 FROM public.shifts s
        WHERE s.employee_id = NEW.user_id
        AND s.date = current_date_iter
        AND s.status != 'cancelled'
      ) INTO shift_conflict_exists;
      
      -- Wenn Konflikte existieren, markiere sie
      IF shift_conflict_exists THEN
        -- Aktualisiere Schichten als konfliktbehaftet
        UPDATE public.shifts 
        SET 
          status = 'conflict',
          notes = COALESCE(notes || ' | ', '') || 'Konflikt mit genehmigter Abwesenheit vom ' || NEW.start_date::text
        WHERE employee_id = NEW.user_id
        AND date = current_date_iter
        AND status != 'cancelled';
        
        -- Erstelle Konflikt-Event für Benachrichtigungen
        INSERT INTO public.cross_module_events (
          event_type,
          source_module,
          source_id,
          user_id,
          employee_name,
          department,
          start_date,
          end_date,
          status,
          metadata
        ) VALUES (
          'shift_conflict',
          'absence',
          NEW.id,
          NEW.user_id,
          COALESCE(NEW.employee_name, 'Unbekannt'),
          COALESCE(NEW.department, 'Unbekannt'),
          current_date_iter,
          current_date_iter,
          'conflict',
          jsonb_build_object(
            'conflict_type', 'absence_approved',
            'absence_request_id', NEW.id,
            'conflict_date', current_date_iter
          )
        ) ON CONFLICT DO NOTHING;
      END IF;
      
      current_date_iter := current_date_iter + interval '1 day';
    END LOOP;
    
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Bei Fehlern den Trigger nicht stoppen, nur protokollieren
    RAISE NOTICE 'Fehler in sync_approved_absence_to_calendar_and_shifts: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für Abwesenheitsanträge erstellen
DROP TRIGGER IF EXISTS sync_approved_absence_trigger ON public.absence_requests;
CREATE TRIGGER sync_approved_absence_trigger
  AFTER UPDATE ON public.absence_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_approved_absence_to_calendar_and_shifts();

-- Trigger-Funktion für die Berücksichtigung von Abwesenheiten in der Schichtplanung
CREATE OR REPLACE FUNCTION public.check_absence_conflicts_on_shift_creation()
RETURNS TRIGGER AS $$
DECLARE
  absence_exists BOOLEAN;
  absence_info RECORD;
BEGIN
  -- Prüfe ob an diesem Tag eine genehmigte Abwesenheit für den Mitarbeiter existiert
  SELECT EXISTS (
    SELECT 1 FROM public.absence_requests ar
    WHERE ar.user_id = NEW.employee_id
    AND ar.status = 'approved'
    AND NEW.date BETWEEN ar.start_date AND ar.end_date
  ) INTO absence_exists;
  
  -- Wenn Abwesenheit existiert, markiere Schicht als Konflikt
  IF absence_exists THEN
    -- Hole Abwesenheitsinformationen für bessere Fehlermeldung
    SELECT ar.type, ar.reason, ar.employee_name 
    INTO absence_info
    FROM public.absence_requests ar
    WHERE ar.user_id = NEW.employee_id
    AND ar.status = 'approved'
    AND NEW.date BETWEEN ar.start_date AND ar.end_date
    LIMIT 1;
    
    NEW.status := 'conflict';
    NEW.notes := COALESCE(NEW.notes || ' | ', '') || 
                 'Konflikt mit genehmigter Abwesenheit (' || 
                 COALESCE(absence_info.type, 'Unbekannt') || ')';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für Schicht-Erstellung erstellen
DROP TRIGGER IF EXISTS check_absence_conflicts_trigger ON public.shifts;
CREATE TRIGGER check_absence_conflicts_trigger
  BEFORE INSERT OR UPDATE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.check_absence_conflicts_on_shift_creation();

-- Sicherstellen, dass cross_module_events Tabelle existiert
CREATE TABLE IF NOT EXISTS public.cross_module_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('absence', 'sick_leave', 'shift_conflict')),
  source_module TEXT NOT NULL,
  source_id UUID NOT NULL,
  user_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Verhindere Duplikate
  UNIQUE(source_module, source_id, user_id, start_date)
);

-- RLS für cross_module_events aktivieren
ALTER TABLE public.cross_module_events ENABLE ROW LEVEL SECURITY;

-- Policy für cross_module_events
CREATE POLICY "Users can view relevant cross module events" ON public.cross_module_events
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Allow creation of cross module events" ON public.cross_module_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updating cross module events" ON public.cross_module_events
  FOR UPDATE USING (true);
