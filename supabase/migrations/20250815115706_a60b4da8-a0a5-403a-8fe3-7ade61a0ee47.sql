-- Erste: Schichttypen Tabelle erstellen (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.shift_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  required_staff INTEGER DEFAULT 1,
  description TEXT,
  min_employees INTEGER DEFAULT 1,
  max_employees INTEGER DEFAULT 10,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Schichten Tabelle erstellen (falls nicht vorhanden) 
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID,
  shift_type_id UUID REFERENCES public.shift_types(id),
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  requirements TEXT[],
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies für shift_types
ALTER TABLE public.shift_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shift types company isolation"
ON public.shift_types
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- RLS Policies für shifts
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shifts company isolation"
ON public.shifts
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- Auto-assign company_id Trigger für shift_types
CREATE OR REPLACE TRIGGER auto_assign_company_shift_types
  BEFORE INSERT ON public.shift_types
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

-- Auto-assign company_id Trigger für shifts
CREATE OR REPLACE TRIGGER auto_assign_company_shifts
  BEFORE INSERT ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_shifts_date_employee ON public.shifts(date, employee_id);
CREATE INDEX IF NOT EXISTS idx_shifts_company_date ON public.shifts(company_id, date);
CREATE INDEX IF NOT EXISTS idx_shift_types_company ON public.shift_types(company_id, is_active);