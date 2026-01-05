-- Retry without pg_cron scheduling (will add later)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ocr_status') THEN
    CREATE TYPE public.ocr_status AS ENUM ('queued','processing','done','error');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.sick_leave_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  absence_request_id uuid NOT NULL REFERENCES public.absence_requests(id) ON DELETE CASCADE,
  reason_category text,
  ocr_extracted_start date,
  ocr_extracted_end date,
  ocr_confidence numeric,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.au_ocr_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  absence_document_id uuid NOT NULL REFERENCES public.absence_documents(id) ON DELETE CASCADE,
  status public.ocr_status NOT NULL DEFAULT 'queued',
  extracted_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sick_pay_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  absence_request_id uuid NOT NULL REFERENCES public.absence_requests(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_absence_requests_type_status ON public.absence_requests(absence_type, status);
CREATE INDEX IF NOT EXISTS idx_absence_requests_user_dates ON public.absence_requests(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_au_ocr_queue_status ON public.au_ocr_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_sick_leave_details_absreq ON public.sick_leave_details(absence_request_id);
CREATE INDEX IF NOT EXISTS idx_sick_pay_events_status ON public.sick_pay_events(status, created_at);

ALTER TABLE public.sick_leave_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.au_ocr_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sick_pay_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sick_leave_details' AND policyname='sld_admin_hr_all') THEN
    CREATE POLICY "sld_admin_hr_all" ON public.sick_leave_details
      FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin')))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin')));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='au_ocr_queue' AND policyname='auq_admin_hr_all') THEN
    CREATE POLICY "auq_admin_hr_all" ON public.au_ocr_queue
      FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin')))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin')));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sick_pay_events' AND policyname='spe_admin_hr_all') THEN
    CREATE POLICY "spe_admin_hr_all" ON public.sick_pay_events
      FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin')))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin')));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sick_pay_events' AND policyname='spe_owner_read') THEN
    CREATE POLICY "spe_owner_read" ON public.sick_pay_events
      FOR SELECT USING (auth.uid() = (SELECT ar.user_id FROM public.absence_requests ar WHERE ar.id = sick_pay_events.absence_request_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='absence_documents' AND policyname='absence_docs_hr_view') THEN
    CREATE POLICY "absence_docs_hr_view" ON public.absence_documents
      FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin')));
  END IF;
END $$;

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

CREATE OR REPLACE FUNCTION public.enqueue_au_for_ocr()
RETURNS TRIGGER AS $$
DECLARE
  is_sick boolean;
BEGIN
  SELECT (ar.absence_type = 'sick_leave') INTO is_sick
  FROM public.absence_requests ar
  WHERE ar.id = NEW.absence_request_id;

  IF is_sick THEN
    INSERT INTO public.au_ocr_queue (absence_document_id, status) VALUES (NEW.id, 'queued');
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_enqueue_au_for_ocr') THEN
    CREATE TRIGGER trg_enqueue_au_for_ocr AFTER INSERT ON public.absence_documents
    FOR EACH ROW EXECUTE FUNCTION public.enqueue_au_for_ocr();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_sick_leave_approval()
RETURNS TRIGGER AS $$
DECLARE
  d date;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM NEW.status) AND (NEW.absence_type = 'sick_leave') THEN
    d := NEW.start_date;
    WHILE d <= NEW.end_date LOOP
      BEGIN
        INSERT INTO public.absences (start_date, end_date, user_id, employee_id, status, type_id, notes)
        VALUES (d::timestamptz, (d || ' 23:59:59')::timestamptz, NEW.user_id, NEW.user_id, 'approved', NULL, 'Sick leave auto');
      EXCEPTION WHEN OTHERS THEN NULL; END;
      d := d + INTERVAL '1 day';
    END LOOP;

    INSERT INTO public.sick_pay_events (absence_request_id, employee_id, start_date, end_date, status)
    VALUES (NEW.id, NEW.user_id, NEW.start_date, NEW.end_date, 'pending');

    BEGIN
      PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='position_assignments';
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
    CREATE TRIGGER trg_handle_sick_leave_approval AFTER UPDATE ON public.absence_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_sick_leave_approval();
  END IF;
END $$;

ALTER TABLE public.au_ocr_queue REPLICA IDENTITY FULL;
ALTER TABLE public.sick_pay_events REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.au_ocr_queue'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.sick_pay_events'; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;