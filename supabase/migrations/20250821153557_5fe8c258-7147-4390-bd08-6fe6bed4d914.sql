-- Erstelle Schichttypen Tabelle
CREATE TABLE IF NOT EXISTS public.shift_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  description TEXT,
  min_employees INTEGER DEFAULT 1,
  max_employees INTEGER DEFAULT 10,
  required_staff INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Erstelle Schichten Tabelle
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_type_id UUID NOT NULL REFERENCES public.shift_types(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  date DATE NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'conflict', 'cancelled')),
  notes TEXT,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Erweitere employees Tabelle falls notwendig
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS qualifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_shifts TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS available_hours JSONB DEFAULT '{"start": "08:00", "end": "17:00"}';

-- Enable RLS
ALTER TABLE public.shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies für shift_types
CREATE POLICY "shift_types_select_policy" ON public.shift_types FOR SELECT USING (
  company_id IS NULL OR 
  company_id = auth.jwt() ->> 'company_id'::text OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('superadmin', 'admin')
  )
);

CREATE POLICY "shift_types_insert_policy" ON public.shift_types FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('superadmin', 'admin', 'manager')
  )
);

CREATE POLICY "shift_types_update_policy" ON public.shift_types FOR UPDATE USING (
  company_id IS NULL OR 
  company_id = auth.jwt() ->> 'company_id'::text OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('superadmin', 'admin', 'manager')
  )
);

-- RLS Policies für shifts
CREATE POLICY "shifts_select_policy" ON public.shifts FOR SELECT USING (
  company_id IS NULL OR 
  company_id = auth.jwt() ->> 'company_id'::text OR
  employee_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('superadmin', 'admin', 'manager')
  )
);

CREATE POLICY "shifts_insert_policy" ON public.shifts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('superadmin', 'admin', 'manager')
  )
);

CREATE POLICY "shifts_update_policy" ON public.shifts FOR UPDATE USING (
  company_id IS NULL OR 
  company_id = auth.jwt() ->> 'company_id'::text OR
  employee_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('superadmin', 'admin', 'manager')
  )
);

CREATE POLICY "shifts_delete_policy" ON public.shifts FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('superadmin', 'admin', 'manager')
  )
);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shift_types_updated_at
  BEFORE UPDATE ON public.shift_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Testdaten für Schichttypen
INSERT INTO public.shift_types (name, start_time, end_time, color, description, required_staff) VALUES
('Frühschicht', '06:00:00', '14:00:00', '#10B981', 'Frühe Schicht für Produktionsbeginn', 2),
('Spätschicht', '14:00:00', '22:00:00', '#F59E0B', 'Späte Schicht für Produktionsende', 2),
('Nachtschicht', '22:00:00', '06:00:00', '#8B5CF6', 'Nachtschicht für 24/7 Betrieb', 1),
('Tagschicht', '08:00:00', '16:00:00', '#3B82F6', 'Standard Tagschicht', 3),
('Wochenendschicht', '09:00:00', '17:00:00', '#EF4444', 'Wochenendabdeckung', 1),
('Bereitschaftsdienst', '00:00:00', '23:59:59', '#6B7280', 'Bereitschaftsdienst bei Bedarf', 1)
ON CONFLICT DO NOTHING;