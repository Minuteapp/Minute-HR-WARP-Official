-- Create missing tables used by the app and add basic RLS so features work

-- 1) Team goals (was 404)
CREATE TABLE IF NOT EXISTS public.team_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  progress int DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  category text,
  user_id uuid, -- optional owner/assignee (auth user id)
  company_id uuid,
  created_by uuid, -- creator (auth user id)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_goals ENABLE ROW LEVEL SECURITY;

-- Read: admins all, otherwise own company or self-related
DROP POLICY IF EXISTS "Team goals readable" ON public.team_goals;
CREATE POLICY "Team goals readable"
ON public.team_goals
FOR SELECT
USING (
  is_admin_safe(auth.uid())
  OR company_id IS NULL 
  OR company_id = get_current_tenant_id()
  OR user_id = auth.uid()
  OR created_by = auth.uid()
);

-- Insert: authenticated users can create for themselves; admins unrestricted
DROP POLICY IF EXISTS "Team goals insert" ON public.team_goals;
CREATE POLICY "Team goals insert"
ON public.team_goals
FOR INSERT
WITH CHECK (
  is_admin_safe(auth.uid())
  OR created_by = auth.uid()
  OR user_id = auth.uid()
);

-- Update: owner or admin
DROP POLICY IF EXISTS "Team goals update" ON public.team_goals;
CREATE POLICY "Team goals update"
ON public.team_goals
FOR UPDATE
USING (
  is_admin_safe(auth.uid())
  OR created_by = auth.uid()
  OR user_id = auth.uid()
);

-- Delete: admins
DROP POLICY IF EXISTS "Team goals delete" ON public.team_goals;
CREATE POLICY "Team goals delete"
ON public.team_goals
FOR DELETE
USING (is_admin_safe(auth.uid()));


-- 2) Employee certificates (was 404)
CREATE TABLE IF NOT EXISTS public.employee_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  name text NOT NULL,
  provider text,
  issued_date date,
  expiry_date date,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee certificates select" ON public.employee_certificates;
CREATE POLICY "Employee certificates select"
ON public.employee_certificates
FOR SELECT
USING (
  is_admin_safe(auth.uid()) OR employee_id = auth.uid()
);

DROP POLICY IF EXISTS "Employee certificates insert" ON public.employee_certificates;
CREATE POLICY "Employee certificates insert"
ON public.employee_certificates
FOR INSERT
WITH CHECK (
  is_admin_safe(auth.uid()) OR employee_id = auth.uid()
);

DROP POLICY IF EXISTS "Employee certificates update" ON public.employee_certificates;
CREATE POLICY "Employee certificates update"
ON public.employee_certificates
FOR UPDATE
USING (
  is_admin_safe(auth.uid()) OR employee_id = auth.uid()
);

DROP POLICY IF EXISTS "Employee certificates delete" ON public.employee_certificates;
CREATE POLICY "Employee certificates delete"
ON public.employee_certificates
FOR DELETE
USING (is_admin_safe(auth.uid()));


-- 3) Employee trainings (was 404)
CREATE TABLE IF NOT EXISTS public.employee_trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  title text NOT NULL,
  provider text,
  start_date date,
  end_date date,
  status text DEFAULT 'planned',
  certificate_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_trainings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee trainings select" ON public.employee_trainings;
CREATE POLICY "Employee trainings select"
ON public.employee_trainings
FOR SELECT
USING (
  is_admin_safe(auth.uid()) OR employee_id = auth.uid()
);

DROP POLICY IF EXISTS "Employee trainings insert" ON public.employee_trainings;
CREATE POLICY "Employee trainings insert"
ON public.employee_trainings
FOR INSERT
WITH CHECK (
  is_admin_safe(auth.uid()) OR employee_id = auth.uid()
);

DROP POLICY IF EXISTS "Employee trainings update" ON public.employee_trainings;
CREATE POLICY "Employee trainings update"
ON public.employee_trainings
FOR UPDATE
USING (
  is_admin_safe(auth.uid()) OR employee_id = auth.uid()
);

DROP POLICY IF EXISTS "Employee trainings delete" ON public.employee_trainings;
CREATE POLICY "Employee trainings delete"
ON public.employee_trainings
FOR DELETE
USING (is_admin_safe(auth.uid()));


-- 4) Helper triggers to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_team_goals_updated_at ON public.team_goals;
CREATE TRIGGER trg_team_goals_updated_at
BEFORE UPDATE ON public.team_goals
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();