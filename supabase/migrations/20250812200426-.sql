-- Performance-Indizes für Kalender-Endpunkt
DO $$ BEGIN
  -- absence_requests: Index auf Datumsbereich
  IF to_regclass('public.idx_absence_requests_date_range') IS NULL THEN
    CREATE INDEX idx_absence_requests_date_range ON public.absence_requests (start_date, end_date);
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- Tabelle existiert nicht, ignoriere
END $$;

DO $$ BEGIN
  -- absences: Index auf Datumsbereich
  IF to_regclass('public.idx_absences_date_range') IS NULL THEN
    CREATE INDEX idx_absences_date_range ON public.absences (start_date, end_date);
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- Tabelle existiert nicht, ignoriere
END $$;

DO $$ BEGIN
  -- calendar_events: Index auf Start/Ende Zeiten
  IF to_regclass('public.idx_calendar_events_time') IS NULL THEN
    CREATE INDEX idx_calendar_events_time ON public.calendar_events (start_time, end_time);
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- Tabelle existiert nicht, ignoriere
END $$;