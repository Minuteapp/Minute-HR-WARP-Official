-- 1) Qualifications
CREATE TABLE IF NOT EXISTS public.qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  max_level INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  company_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Machines / Turbines
CREATE TABLE IF NOT EXISTS public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  site_id UUID NULL,
  location TEXT,
  required_qualification_id UUID NULL REFERENCES public.qualifications(id) ON DELETE SET NULL,
  min_level INTEGER DEFAULT 1,
  risk_class TEXT DEFAULT 'normal',
  is_active BOOLEAN DEFAULT true,
  company_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3) Employee Qualifications
CREATE TABLE IF NOT EXISTS public.employee_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  qualification_id UUID NOT NULL REFERENCES public.qualifications(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  valid_from DATE,
  valid_to DATE,
  evidence_doc_id UUID NULL,
  supervisor_approval BOOLEAN DEFAULT false,
  company_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, qualification_id)
);

-- 4) Shift Positions (position slots per shift)
CREATE TABLE IF NOT EXISTS public.shift_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  machine_id UUID NULL REFERENCES public.machines(id) ON DELETE SET NULL,
  required_qualification_id UUID NULL REFERENCES public.qualifications(id) ON DELETE SET NULL,
  min_level INTEGER DEFAULT 1,
  headcount INTEGER DEFAULT 1 CHECK (headcount > 0),
  handover_minutes INTEGER DEFAULT 0 CHECK (handover_minutes >= 0),
  notes TEXT,
  company_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5) Position Assignments (employees assigned to position slots)
CREATE TABLE IF NOT EXISTS public.position_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES public.shift_positions(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'planned', -- planned|confirmed|checked_in|completed
  assigned_by UUID NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  checked_in_at TIMESTAMPTZ NULL,
  checked_out_at TIMESTAMPTZ NULL,
  company_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6) Employee Availability
CREATE TABLE IF NOT EXISTS public.employee_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type TEXT DEFAULT 'available', -- available|unavailable|preferred|blocked
  notes TEXT,
  company_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_time_range CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_machines_code ON public.machines(code);
CREATE INDEX IF NOT EXISTS idx_emp_qual_employee ON public.employee_qualifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_positions_shift ON public.shift_positions(shift_id);
CREATE INDEX IF NOT EXISTS idx_assignments_position ON public.position_assignments(position_id);
CREATE INDEX IF NOT EXISTS idx_availability_emp_date ON public.employee_availability(employee_id, date);

-- Triggers: updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_qualifications_updated_at'
  ) THEN
    CREATE TRIGGER trg_qualifications_updated_at
    BEFORE UPDATE ON public.qualifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_machines_updated_at'
  ) THEN
    CREATE TRIGGER trg_machines_updated_at
    BEFORE UPDATE ON public.machines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_empqual_updated_at'
  ) THEN
    CREATE TRIGGER trg_empqual_updated_at
    BEFORE UPDATE ON public.employee_qualifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_shift_positions_updated_at'
  ) THEN
    CREATE TRIGGER trg_shift_positions_updated_at
    BEFORE UPDATE ON public.shift_positions
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
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_employee_availability_updated_at'
  ) THEN
    CREATE TRIGGER trg_employee_availability_updated_at
    BEFORE UPDATE ON public.employee_availability
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Triggers: auto-assign company_id on INSERT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auto_company_qualifications'
  ) THEN
    CREATE TRIGGER trg_auto_company_qualifications
    BEFORE INSERT ON public.qualifications
    FOR EACH ROW EXECUTE PROCEDURE public.auto_assign_company_id();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auto_company_machines'
  ) THEN
    CREATE TRIGGER trg_auto_company_machines
    BEFORE INSERT ON public.machines
    FOR EACH ROW EXECUTE PROCEDURE public.auto_assign_company_id();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auto_company_empqual'
  ) THEN
    CREATE TRIGGER trg_auto_company_empqual
    BEFORE INSERT ON public.employee_qualifications
    FOR EACH ROW EXECUTE PROCEDURE public.auto_assign_company_id();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auto_company_shift_positions'
  ) THEN
    CREATE TRIGGER trg_auto_company_shift_positions
    BEFORE INSERT ON public.shift_positions
    FOR EACH ROW EXECUTE PROCEDURE public.auto_assign_company_id();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auto_company_position_assignments'
  ) THEN
    CREATE TRIGGER trg_auto_company_position_assignments
    BEFORE INSERT ON public.position_assignments
    FOR EACH ROW EXECUTE PROCEDURE public.auto_assign_company_id();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auto_company_employee_availability'
  ) THEN
    CREATE TRIGGER trg_auto_company_employee_availability
    BEFORE INSERT ON public.employee_availability
    FOR EACH ROW EXECUTE PROCEDURE public.auto_assign_company_id();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_availability ENABLE ROW LEVEL SECURITY;

-- Policies: Company Isolation helper condition used repeatedly
-- Qualifications
DROP POLICY IF EXISTS "qualifications_company_isolation_select" ON public.qualifications;
CREATE POLICY "qualifications_company_isolation_select" ON public.qualifications
FOR SELECT USING (
  CASE
    WHEN public.is_in_tenant_context() THEN company_id = public.get_tenant_company_id_safe()
    WHEN public.is_superadmin_safe(auth.uid()) AND NOT public.is_in_tenant_context() THEN true
    ELSE company_id = public.get_user_company_id(auth.uid())
  END
);

DROP POLICY IF EXISTS "qualifications_admin_manage" ON public.qualifications;
CREATE POLICY "qualifications_admin_manage" ON public.qualifications
FOR ALL USING (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()))
WITH CHECK (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()));

-- Machines
DROP POLICY IF EXISTS "machines_company_isolation_select" ON public.machines;
CREATE POLICY "machines_company_isolation_select" ON public.machines
FOR SELECT USING (
  CASE
    WHEN public.is_in_tenant_context() THEN company_id = public.get_tenant_company_id_safe()
    WHEN public.is_superadmin_safe(auth.uid()) AND NOT public.is_in_tenant_context() THEN true
    ELSE company_id = public.get_user_company_id(auth.uid())
  END
);

DROP POLICY IF EXISTS "machines_admin_manage" ON public.machines;
CREATE POLICY "machines_admin_manage" ON public.machines
FOR ALL USING (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()))
WITH CHECK (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()));

-- Employee Qualifications
DROP POLICY IF EXISTS "empqual_company_isolation_select" ON public.employee_qualifications;
CREATE POLICY "empqual_company_isolation_select" ON public.employee_qualifications
FOR SELECT USING (
  (employee_id = auth.uid()) OR (
    CASE
      WHEN public.is_in_tenant_context() THEN company_id = public.get_tenant_company_id_safe()
      WHEN public.is_superadmin_safe(auth.uid()) AND NOT public.is_in_tenant_context() THEN true
      ELSE company_id = public.get_user_company_id(auth.uid())
    END
  )
);

DROP POLICY IF EXISTS "empqual_admin_manage" ON public.employee_qualifications;
CREATE POLICY "empqual_admin_manage" ON public.employee_qualifications
FOR ALL USING (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()))
WITH CHECK (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()));

-- Shift Positions
DROP POLICY IF EXISTS "shift_positions_company_isolation_select" ON public.shift_positions;
CREATE POLICY "shift_positions_company_isolation_select" ON public.shift_positions
FOR SELECT USING (
  CASE
    WHEN public.is_in_tenant_context() THEN company_id = public.get_tenant_company_id_safe()
    WHEN public.is_superadmin_safe(auth.uid()) AND NOT public.is_in_tenant_context() THEN true
    ELSE company_id = public.get_user_company_id(auth.uid())
  END
);

DROP POLICY IF EXISTS "shift_positions_admin_manage" ON public.shift_positions;
CREATE POLICY "shift_positions_admin_manage" ON public.shift_positions
FOR ALL USING (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()))
WITH CHECK (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()));

-- Position Assignments
DROP POLICY IF EXISTS "assignments_company_or_self_select" ON public.position_assignments;
CREATE POLICY "assignments_company_or_self_select" ON public.position_assignments
FOR SELECT USING (
  (employee_id = auth.uid()) OR (
    CASE
      WHEN public.is_in_tenant_context() THEN company_id = public.get_tenant_company_id_safe()
      WHEN public.is_superadmin_safe(auth.uid()) AND NOT public.is_in_tenant_context() THEN true
      ELSE company_id = public.get_user_company_id(auth.uid())
    END
  )
);

DROP POLICY IF EXISTS "assignments_admin_manage" ON public.position_assignments;
CREATE POLICY "assignments_admin_manage" ON public.position_assignments
FOR INSERT WITH CHECK (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()));
CREATE POLICY "assignments_admin_update_delete" ON public.position_assignments
FOR UPDATE USING (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()))
WITH CHECK (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()));
CREATE POLICY "assignments_admin_delete" ON public.position_assignments
FOR DELETE USING (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()));

-- Allow employees to update their own assignment status (e.g., confirm)
DROP POLICY IF EXISTS "assignments_employee_update_own" ON public.position_assignments;
CREATE POLICY "assignments_employee_update_own" ON public.position_assignments
FOR UPDATE USING (employee_id = auth.uid())
WITH CHECK (employee_id = auth.uid());

-- Employee Availability
DROP POLICY IF EXISTS "availability_select_self_or_company" ON public.employee_availability;
CREATE POLICY "availability_select_self_or_company" ON public.employee_availability
FOR SELECT USING (
  (employee_id = auth.uid()) OR (
    CASE
      WHEN public.is_in_tenant_context() THEN company_id = public.get_tenant_company_id_safe()
      WHEN public.is_superadmin_safe(auth.uid()) AND NOT public.is_in_tenant_context() THEN true
      ELSE company_id = public.get_user_company_id(auth.uid())
    END
  )
);

DROP POLICY IF EXISTS "availability_employee_manage_self" ON public.employee_availability;
CREATE POLICY "availability_employee_manage_self" ON public.employee_availability
FOR ALL USING (employee_id = auth.uid())
WITH CHECK (employee_id = auth.uid());

DROP POLICY IF EXISTS "availability_admin_manage" ON public.employee_availability;
CREATE POLICY "availability_admin_manage" ON public.employee_availability
FOR ALL USING (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()))
WITH CHECK (public.is_admin_safe(auth.uid()) OR public.is_superadmin_safe(auth.uid()));
