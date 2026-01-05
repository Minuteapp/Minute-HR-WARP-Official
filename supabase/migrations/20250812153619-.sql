-- Krankmeldungen Backend-Erweiterung (ohne UI-Änderungen)
-- 1) Enums/Extensions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ocr_status') THEN
    CREATE TYPE public.ocr_status AS ENUM ('queued','processing','done','error');
  END IF;
END $$;

-- Enable extensions if available (ignore errors if already enabled/not allowed)
DO $$ BEGIN
  BEGIN
    EXECUTE 'create extension if not exists pg_cron';
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    EXECUTE 'create extension if not exists pg_net';
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- 2) Detailtabelle für vertrauliche Krankmeldungsdaten (nur HR/Admin sichtbar)
CREATE TABLE IF NOT EXISTS public.sick_leave_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  absence_request_id uuid NOT NULL REFERENCES public.absence_requests(id) ON DELETE CASCADE,
  reason_category text,                -- Grundkategorie (nur HR sichtbar)
  ocr_extracted_start date,
  ocr_extracted_end date,
  ocr_confidence numeric,
  created_by uuid,                     -- HR-Bearbeiter
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) AU-OCR-Queue (für Krankmeldungsdokumente)
CREATE TABLE IF NOT EXISTS public.au_ocr_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  absence_document_id uuid NOT NULL REFERENCES public.absence_documents(id) ON DELETE CASCADE,
  status public.ocr_status NOT NULL DEFAULT 'queued',
  extracted_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4) Payroll-Events (Lohnfortzahlung/Krankengeld)
CREATE TABLE IF NOT EXISTS public.sick_pay_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  absence_request_id uuid NOT NULL REFERENCES public.absence_requests(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',  -- pending|exported|error
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5) Indizes für Skalierung
CREATE INDEX IF NOT EXISTS idx_absence_requests_type_status ON public.absence_requests(absence_type, status);
CREATE INDEX IF NOT EXISTS idx_absence_requests_user_dates ON public.absence_requests(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_au_ocr_queue_status ON public.au_ocr_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_sick_leave_details_absreq ON public.sick_leave_details(absence_request_id);
CREATE INDEX IF NOT EXISTS idx_sick_pay_events_status ON public.sick_pay_events(status, created_at);

-- 6) RLS aktivieren
ALTER TABLE public.sick_leave_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.au_ocr_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sick_pay_events ENABLE ROW LEVEL SECURITY;

-- 7) RLS Policies
-- sick_leave_details: Nur HR/Admin/Superadmin sehen & pflegen
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sick_leave_details' AND policyname='sld_admin_hr_all') THEN
    CREATE POLICY "sld_admin_hr_all" ON public.sick_leave_details
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
    );
  END IF;
END $$;

-- au_ocr_queue: Nur HR/Admin/Superadmin lesen/schreiben
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='au_ocr_queue' AND policyname='auq_admin_hr_all') THEN
    CREATE POLICY "auq_admin_hr_all" ON public.au_ocr_queue
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
    );
  END IF;
END $$;

-- sick_pay_events: Admin/HR sehen & pflegen, Mitarbeiter nur eigene lesen
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sick_pay_events' AND policyname='spe_admin_hr_all') THEN
    CREATE POLICY "spe_admin_hr_all" ON public.sick_pay_events
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sick_pay_events' AND policyname='spe_owner_read') THEN
    CREATE POLICY "spe_owner_read" ON public.sick_pay_events
    FOR SELECT USING (
      auth.uid() = (
        SELECT ar.user_id FROM public.absence_requests ar WHERE ar.id = sick_pay_events.absence_request_id
      )
    );
  END IF;
END $$;

-- 8) Zusätzliche Policy: HR/Admin darf AU-Dokumente sehen
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='absence_documents' AND policyname='absence_docs_hr_view') THEN
    CREATE POLICY "absence_docs_hr_view" ON public.absence_documents
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
    );
  END IF;
END $$;

-- 9) Trigger: updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_sick_leave_details_upd') THEN
    CREATE TRIGGER trg_sick_leave_details_upd BEFORE UPDATE ON public.sick_leave_details
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_au_ocr_queue_upd') THEN
    CREATE TRIGGER trg_au_ocr_queue_upd BEFORE UPDATE ON public.au_ocr_queue
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_sick_pay_events_upd') THEN
    CREATE TRIGGER trg_sick_pay_events_upd BEFORE UPDATE ON public.sick_pay_events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 10) Trigger: Bei neuem Krankmeldungs-Dokument (AU) automatisch in OCR-Queue enqueuen
CREATE OR REPLACE FUNCTION public.enqueue_au_for_ocr()
RETURNS TRIGGER AS $$
DECLARE
  is_sick boolean;
BEGIN
  -- Nur verarbeiten, wenn das verknüpfte Request eine Krankmeldung ist
  SELECT (ar.absence_type = 'sick_leave') INTO is_sick
  FROM public.absence_requests ar
  WHERE ar.id = NEW.absence_request_id;

  IF is_sick THEN
    INSERT INTO public.au_ocr_queue (absence_document_id, status)
    VALUES (NEW.id, 'queued');
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_enqueue_au_for_ocr') THEN
    CREATE TRIGGER trg_enqueue_au_for_ocr
    AFTER INSERT ON public.absence_documents
    FOR EACH ROW EXECUTE FUNCTION public.enqueue_au_for_ocr();
  END IF;
END $$;

-- 11) Trigger: Bei Genehmigung von Krankmeldung -> Absences/Payroll/Schichten
CREATE OR REPLACE FUNCTION public.handle_sick_leave_approval()
RETURNS TRIGGER AS $$
DECLARE
  d date;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM NEW.status) AND (NEW.absence_type = 'sick_leave') THEN
    -- a) Zeiterfassung: Auto-Abwesenheit je Tag
    d := NEW.start_date;
    WHILE d <= NEW.end_date LOOP
      BEGIN
        INSERT INTO public.absences (start_date, end_date, user_id, employee_id, status, type_id, notes)
        VALUES (d::timestamptz, (d || ' 23:59:59')::timestamptz, NEW.user_id, NEW.user_id, 'approved', NULL, 'Sick leave auto');
      EXCEPTION WHEN OTHERS THEN NULL; END;
      d := d + INTERVAL '1 day';
    END LOOP;

    -- b) Payroll-Hinweis
    INSERT INTO public.sick_pay_events (absence_request_id, employee_id, start_date, end_date, status)
    VALUES (NEW.id, NEW.user_id, NEW.start_date, NEW.end_date, 'pending');

    -- c) Schichtplanung: Zuweisungen des Mitarbeiters an diesen Tagen freigeben (falls Tabelle existiert)
    BEGIN
      PERFORM 1 FROM information_schema.tables 
      WHERE table_schema='public' AND table_name='position_assignments';
      IF FOUND THEN
        UPDATE public.position_assignments pa
        SET status = 'cancelled'
        WHERE pa.employee_id = NEW.user_id
          AND pa.date BETWEEN NEW.start_date AND NEW.end_date;
      END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_handle_sick_leave_approval') THEN
    CREATE TRIGGER trg_handle_sick_leave_approval
    AFTER UPDATE ON public.absence_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_sick_leave_approval();
  END IF;
END $$;

-- 12) Realtime (optional für Live-UI ohne Änderungen)
ALTER TABLE public.au_ocr_queue REPLICA IDENTITY FULL;
ALTER TABLE public.sick_pay_events REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.au_ocr_queue'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.sick_pay_events'; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- 13) Cron-Jobs zum Anstoßen der Edge Functions (Reminder/OCR)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname='schedule' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname='cron')) THEN
    PERFORM cron.schedule(
      'sick-leave-reminders-every-30min',
      '*/30 * * * *',
      $$
      select net.http_post(
        url := 'https://teydpbqficbdgqovoqlo.supabase.co/functions/v1/sick-leave-reminder',
        headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleWRwYnFmaWNiZGdxb3ZvcWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNDc0OTMsImV4cCI6MjA1MzgyMzQ5M30.nl7hQoe8RC9YYw2nwxLbEuEVcJCbfuxAy2dALZI47X0'),
        body := jsonb_build_object('run','scheduled')
      );
      $$
    );
    PERFORM cron.schedule(
      'au-ocr-worker-every-10min',
      '*/10 * * * *',
      $$
      select net.http_post(
        url := 'https://teydpbqficbdgqovoqlo.supabase.co/functions/v1/ocr-au',
        headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleWRwYnFmaWNiZGdxb3ZvcWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNDc0OTMsImV4cCI6MjA1MzgyMzQ5M30.nl7hQoe8RC9YYw2nwxLbEuEVcJCbfuxAy2dALZI47X0'),
        body := jsonb_build_object('run','scheduled')
      );
      $$
    );
  END IF;
END $$;
