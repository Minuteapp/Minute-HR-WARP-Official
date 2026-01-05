-- Schichttypen Tabelle erstellen (einfache Version ohne company_id zunächst)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Schichten Tabelle erstellen (einfache Version ohne company_id zunächst)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies für shift_types (einfache Version)
ALTER TABLE public.shift_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view shift types"
ON public.shift_types
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage shift types"
ON public.shift_types
FOR ALL
USING (is_superadmin_safe(auth.uid()) OR EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr')
));

-- RLS Policies für shifts (einfache Version)
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view shifts"
ON public.shifts
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage shifts"
ON public.shifts
FOR ALL
USING (is_superadmin_safe(auth.uid()) OR EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr')
));

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_shifts_date_employee ON public.shifts(date, employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_types_active ON public.shift_types(is_active);