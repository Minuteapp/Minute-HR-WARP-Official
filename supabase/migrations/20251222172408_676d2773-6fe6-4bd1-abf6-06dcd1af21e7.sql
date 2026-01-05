-- Offboarding Prozesse
CREATE TABLE public.offboarding_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  initiated_by UUID NOT NULL,
  last_working_day DATE,
  reason TEXT, -- resignation, termination, retirement, mutual_agreement
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offboarding Checklisten
CREATE TABLE public.offboarding_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES public.offboarding_processes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('hr', 'it', 'finance', 'equipment', 'access', 'knowledge_transfer')),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMPTZ,
  completed_by UUID,
  due_date DATE,
  assignee_id UUID,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exit Interviews
CREATE TABLE public.offboarding_exit_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES public.offboarding_processes(id) ON DELETE CASCADE NOT NULL,
  scheduled_date TIMESTAMPTZ,
  conducted_by UUID,
  feedback JSONB,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktivieren
ALTER TABLE public.offboarding_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offboarding_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offboarding_exit_interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies für offboarding_processes
CREATE POLICY "Authenticated users can view offboarding processes"
ON public.offboarding_processes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert offboarding processes"
ON public.offboarding_processes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update offboarding processes"
ON public.offboarding_processes FOR UPDATE
TO authenticated
USING (true);

-- RLS Policies für offboarding_checklists
CREATE POLICY "Authenticated users can view offboarding checklists"
ON public.offboarding_checklists FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert offboarding checklists"
ON public.offboarding_checklists FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update offboarding checklists"
ON public.offboarding_checklists FOR UPDATE
TO authenticated
USING (true);

-- RLS Policies für offboarding_exit_interviews
CREATE POLICY "Authenticated users can view exit interviews"
ON public.offboarding_exit_interviews FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert exit interviews"
ON public.offboarding_exit_interviews FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update exit interviews"
ON public.offboarding_exit_interviews FOR UPDATE
TO authenticated
USING (true);

-- Trigger für updated_at
CREATE TRIGGER update_offboarding_processes_updated_at
BEFORE UPDATE ON public.offboarding_processes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();