-- Fix: rename date column to work_date to avoid conflicts
DROP TABLE IF EXISTS public.employee_availability CASCADE;

CREATE TABLE public.employee_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type TEXT DEFAULT 'available', -- available|unavailable|preferred|blocked
  notes TEXT,
  company_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_availability_emp_work_date ON public.employee_availability(employee_id, work_date);

-- Recreate triggers and RLS for employee_availability
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_employee_availability_updated_at'
  ) THEN
    CREATE TRIGGER trg_employee_availability_updated_at
    BEFORE UPDATE ON public.employee_availability
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auto_company_employee_availability'
  ) THEN
    CREATE TRIGGER trg_auto_company_employee_availability
    BEFORE INSERT ON public.employee_availability
    FOR EACH ROW EXECUTE PROCEDURE public.auto_assign_company_id();
  END IF;
END $$;

ALTER TABLE public.employee_availability ENABLE ROW LEVEL SECURITY;

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
