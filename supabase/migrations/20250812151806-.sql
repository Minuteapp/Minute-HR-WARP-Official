-- Shift Planning + Business Travel Extensions - Initial Schema
-- 1) ENUMs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assignment_status') THEN
    CREATE TYPE public.assignment_status AS ENUM ('scheduled','checked_in','completed','cancelled','swap_pending');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bid_status') THEN
    CREATE TYPE public.bid_status AS ENUM ('open','withdrawn','accepted','rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'swap_status') THEN
    CREATE TYPE public.swap_status AS ENUM ('pending','approved','rejected','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    CREATE TYPE public.approval_status AS ENUM ('pending','approved','rejected','escalated','auto_approved');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
    CREATE TYPE public.document_status AS ENUM ('valid','expired','pending','rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ocr_status') THEN
    CREATE TYPE public.ocr_status AS ENUM ('queued','processing','done','error');
  END IF;
END $$;

-- 2) Turbinen-Positionen (T1..T10)
CREATE TABLE IF NOT EXISTS public.turbine_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed T1..T10
INSERT INTO public.turbine_positions (code, name)
SELECT t.code, t.name
FROM (
  VALUES ('T1','Turbine 1'),('T2','Turbine 2'),('T3','Turbine 3'),('T4','Turbine 4'),('T5','Turbine 5'),
         ('T6','Turbine 6'),('T7','Turbine 7'),('T8','Turbine 8'),('T9','Turbine 9'),('T10','Turbine 10')
) AS t(code,name)
ON CONFLICT (code) DO NOTHING;

-- 3) Slots je Schicht und Turbine
CREATE TABLE IF NOT EXISTS public.shift_position_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id uuid NOT NULL,
  turbine_code text NOT NULL REFERENCES public.turbine_positions(code) ON UPDATE CASCADE,
  required_qualification_type text,
  required_level integer,
  two_person_required boolean NOT NULL DEFAULT false,
  handover_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4) Mitarbeiter-Qualifikationen
CREATE TABLE IF NOT EXISTS public.employee_qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  user_id uuid, -- optional für RLS (auth.users.id)
  qualification_type text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  valid_until date,
  document_id uuid, -- Verknüpfung ins Dokumente-Modul (optional)
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5) Position Assignments (Zuweisungen je Slot/Turbine)
CREATE TABLE IF NOT EXISTS public.position_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id uuid,
  slot_id uuid REFERENCES public.shift_position_slots(id) ON DELETE SET NULL,
  turbine_code text NOT NULL REFERENCES public.turbine_positions(code) ON UPDATE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  user_id uuid, -- auth.users.id (für RLS)
  date date NOT NULL,
  start_time timestamptz,
  end_time timestamptz,
  status public.assignment_status NOT NULL DEFAULT 'scheduled',
  cost_rate numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6) Open Shift Bids (Gebote auf offene Slots)
CREATE TABLE IF NOT EXISTS public.open_shift_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id uuid,
  slot_id uuid REFERENCES public.shift_position_slots(id) ON DELETE CASCADE,
  turbine_code text REFERENCES public.turbine_positions(code) ON UPDATE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status public.bid_status NOT NULL DEFAULT 'open',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7) Swap Requests (Tausch direkt/verkettet)
CREATE TABLE IF NOT EXISTS public.swap_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_assignment_id uuid NOT NULL REFERENCES public.position_assignments(id) ON DELETE CASCADE,
  target_assignment_id uuid REFERENCES public.position_assignments(id) ON DELETE CASCADE,
  chain_group_id uuid,
  status public.swap_status NOT NULL DEFAULT 'pending',
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by uuid
);

-- 8) Business Travel: Approvals
CREATE TABLE IF NOT EXISTS public.business_trip_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_trip_id uuid NOT NULL,
  step_order integer NOT NULL,
  approver_id uuid NOT NULL,
  status public.approval_status NOT NULL DEFAULT 'pending',
  decision_at timestamptz,
  decision_by uuid,
  notes text,
  reminder_count integer NOT NULL DEFAULT 0,
  escalated boolean NOT NULL DEFAULT false,
  user_id uuid, -- requester
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9) Business Travel: Dokumente (Pass/Visa/Versicherung/Tickets)
CREATE TABLE IF NOT EXISTS public.travel_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_trip_id uuid,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  user_id uuid, -- auth.users.id
  doc_type text NOT NULL,
  file_path text NOT NULL,
  expires_at date,
  status public.document_status NOT NULL DEFAULT 'valid',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10) Expense OCR Queue
CREATE TABLE IF NOT EXISTS public.expense_ocr_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL,
  file_path text NOT NULL,
  status public.ocr_status NOT NULL DEFAULT 'queued',
  extracted_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 11) Mileage Calculations
CREATE TABLE IF NOT EXISTS public.mileage_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_trip_id uuid,
  expense_id uuid,
  origin text,
  destination text,
  distance_km numeric,
  rate_per_km numeric,
  amount numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 12) Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_shift_position_slots_updated_at'
  ) THEN
    CREATE TRIGGER trg_shift_position_slots_updated_at
    BEFORE UPDATE ON public.shift_position_slots
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_employee_qualifications_updated_at'
  ) THEN
    CREATE TRIGGER trg_employee_qualifications_updated_at
    BEFORE UPDATE ON public.employee_qualifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_position_assignments_updated_at'
  ) THEN
    CREATE TRIGGER trg_position_assignments_updated_at
    BEFORE UPDATE ON public.position_assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_open_shift_bids_updated_at'
  ) THEN
    CREATE TRIGGER trg_open_shift_bids_updated_at
    BEFORE UPDATE ON public.open_shift_bids
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_business_trip_approvals_updated_at'
  ) THEN
    CREATE TRIGGER trg_business_trip_approvals_updated_at
    BEFORE UPDATE ON public.business_trip_approvals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_travel_documents_updated_at'
  ) THEN
    CREATE TRIGGER trg_travel_documents_updated_at
    BEFORE UPDATE ON public.travel_documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_expense_ocr_queue_updated_at'
  ) THEN
    CREATE TRIGGER trg_expense_ocr_queue_updated_at
    BEFORE UPDATE ON public.expense_ocr_queue
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 13) Conflict Check for Position Assignments (vereinfachte Validierung)
CREATE OR REPLACE FUNCTION public.validate_position_assignment()
RETURNS TRIGGER AS $$
DECLARE
  overlap_count int;
  qual_ok boolean := true;
  req_type text;
  req_level int;
  valid_until date;
BEGIN
  -- Zeitliche Überlappung für selben Mitarbeiter prüfen
  SELECT count(*) INTO overlap_count
  FROM public.position_assignments pa
  WHERE pa.employee_id = NEW.employee_id
    AND pa.date = NEW.date
    AND pa.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')::uuid
    AND (
      (NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL AND pa.start_time IS NOT NULL AND pa.end_time IS NOT NULL AND
       tstzrange(pa.start_time, pa.end_time, '[)') && tstzrange(NEW.start_time, NEW.end_time, '[)'))
      OR (NEW.start_time IS NULL AND NEW.end_time IS NULL)
    );
  IF overlap_count > 0 THEN
    RAISE EXCEPTION 'Konflikt: Zeitliche Überlappung mit bestehender Zuweisung';
  END IF;

  -- Qualifikations-Check falls Slot-Anforderung vorhanden
  IF NEW.slot_id IS NOT NULL THEN
    SELECT s.required_qualification_type, s.required_level
      INTO req_type, req_level
    FROM public.shift_position_slots s
    WHERE s.id = NEW.slot_id;

    IF req_type IS NOT NULL THEN
      SELECT (eq.level >= COALESCE(req_level,1)) AND (eq.valid_until IS NULL OR eq.valid_until >= NEW.date)
        INTO qual_ok
      FROM public.employee_qualifications eq
      WHERE eq.employee_id = NEW.employee_id AND eq.qualification_type = req_type
      ORDER BY eq.level DESC
      LIMIT 1;
      IF qual_ok IS DISTINCT FROM TRUE THEN
        RAISE EXCEPTION 'Konflikt: Qualifikation % (Level %%) unzureichend oder abgelaufen', req_type, COALESCE(req_level,1);
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- Trigger anlegen (INSERT/UPDATE)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_validate_position_assignment_ins'
  ) THEN
    CREATE TRIGGER trg_validate_position_assignment_ins
    BEFORE INSERT ON public.position_assignments
    FOR EACH ROW EXECUTE FUNCTION public.validate_position_assignment();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_validate_position_assignment_upd'
  ) THEN
    CREATE TRIGGER trg_validate_position_assignment_upd
    BEFORE UPDATE ON public.position_assignments
    FOR EACH ROW EXECUTE FUNCTION public.validate_position_assignment();
  END IF;
END $$;

-- 14) Row Level Security
ALTER TABLE public.turbine_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_position_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_shift_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_trip_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_ocr_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mileage_calculations ENABLE ROW LEVEL SECURITY;

-- Policies: Admin/HR/Superadmin Vollzugriff
CREATE POLICY IF NOT EXISTS "turbine_positions_admin_all" ON public.turbine_positions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin')
    )
  );

CREATE POLICY IF NOT EXISTS "shift_slots_admin_all" ON public.shift_position_slots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  );

CREATE POLICY IF NOT EXISTS "employee_qual_admin_all" ON public.employee_qualifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  );

CREATE POLICY IF NOT EXISTS "assignments_admin_all" ON public.position_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  );

CREATE POLICY IF NOT EXISTS "bids_admin_all" ON public.open_shift_bids
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  );

CREATE POLICY IF NOT EXISTS "swaps_admin_all" ON public.swap_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  );

CREATE POLICY IF NOT EXISTS "approvals_admin_all" ON public.business_trip_approvals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  );

CREATE POLICY IF NOT EXISTS "travel_docs_admin_all" ON public.travel_documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  );

CREATE POLICY IF NOT EXISTS "ocr_queue_admin_all" ON public.expense_ocr_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  );

CREATE POLICY IF NOT EXISTS "mileage_admin_all" ON public.mileage_calculations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  );

-- Owner/Employee Policies für eigene Daten
CREATE POLICY IF NOT EXISTS "qual_owner_read" ON public.employee_qualifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "assign_owner_read" ON public.position_assignments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "bids_owner_crud" ON public.open_shift_bids
  FOR SELECT USING (user_id = auth.uid())
  ;
CREATE POLICY IF NOT EXISTS "bids_owner_insert" ON public.open_shift_bids
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "bids_owner_update" ON public.open_shift_bids
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "swaps_owner_insert" ON public.swap_requests
  FOR INSERT WITH CHECK (
    auth.uid() = (
      SELECT pa.user_id FROM public.position_assignments pa
      WHERE pa.id = requester_assignment_id
    )
  );
CREATE POLICY IF NOT EXISTS "swaps_owner_read" ON public.swap_requests
  FOR SELECT USING (
    auth.uid() = (
      SELECT pa.user_id FROM public.position_assignments pa
      WHERE pa.id = requester_assignment_id
    ) OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
  );

CREATE POLICY IF NOT EXISTS "approvals_approver_read_update" ON public.business_trip_approvals
  FOR SELECT USING (approver_id = auth.uid())
  ;
CREATE POLICY IF NOT EXISTS "approvals_approver_update" ON public.business_trip_approvals
  FOR UPDATE USING (approver_id = auth.uid());

CREATE POLICY IF NOT EXISTS "travel_docs_owner_read" ON public.travel_documents
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "ocr_queue_owner_read" ON public.expense_ocr_queue
  FOR SELECT USING (
    auth.uid() = (
      SELECT bte.user_id FROM public.business_trip_expenses bte WHERE bte.id = expense_id
    )
  );

-- 15) Realtime
-- Ensure replica identity
ALTER TABLE public.position_assignments REPLICA IDENTITY FULL;
ALTER TABLE public.open_shift_bids REPLICA IDENTITY FULL;
ALTER TABLE public.swap_requests REPLICA IDENTITY FULL;
ALTER TABLE public.business_trip_approvals REPLICA IDENTITY FULL;
ALTER TABLE public.travel_documents REPLICA IDENTITY FULL;
ALTER TABLE public.expense_ocr_queue REPLICA IDENTITY FULL;

-- Add to realtime publication (idempotent)
DO $$ BEGIN
  -- Will not error if already present
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.position_assignments';
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.open_shift_bids'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.swap_requests'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.business_trip_approvals'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.travel_documents'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.expense_ocr_queue'; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Done
