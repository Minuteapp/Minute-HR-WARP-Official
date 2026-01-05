-- Schichtplanungs-System vollständig implementieren
-- 1. Schichttypen (Früh-, Spät-, Nachtschicht)
CREATE TABLE IF NOT EXISTS public.shift_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  description TEXT,
  min_employees INTEGER DEFAULT 1,
  max_employees INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Schichten (einzelne Arbeitsschichten)
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_type_id UUID REFERENCES public.shift_types(id),
  employee_id UUID REFERENCES public.employees(id),
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'conflict', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Mitarbeiter-Schichtpräferenzen
CREATE TABLE IF NOT EXISTS public.employee_shift_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id),
  shift_type_id UUID REFERENCES public.shift_types(id),
  preference_level INTEGER CHECK (preference_level BETWEEN 1 AND 5), -- 1=niedrig, 5=hoch
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, shift_type_id)
);

-- 4. Mitarbeiter-Verfügbarkeit
CREATE TABLE IF NOT EXISTS public.employee_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sonntag, 6=Samstag
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, day_of_week)
);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shift_types_updated_at 
  BEFORE UPDATE ON public.shift_types 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at 
  BEFORE UPDATE ON public.shifts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Standard-Schichttypen einfügen
INSERT INTO public.shift_types (name, start_time, end_time, color, description) VALUES
('Frühschicht', '06:00:00', '14:00:00', '#10B981', 'Reguläre Frühschicht von 6-14 Uhr'),
('Spätschicht', '14:00:00', '22:00:00', '#F59E0B', 'Reguläre Spätschicht von 14-22 Uhr'),
('Nachtschicht', '22:00:00', '06:00:00', '#6366F1', 'Nachtschicht von 22-6 Uhr'),
('Teilzeit Vormittag', '08:00:00', '12:00:00', '#8B5CF6', 'Teilzeit am Vormittag'),
('Teilzeit Nachmittag', '13:00:00', '17:00:00', '#EC4899', 'Teilzeit am Nachmittag')
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE public.shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_shift_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_availability ENABLE ROW LEVEL SECURITY;

-- Alle authentifizierten Benutzer können Schichttypen lesen
CREATE POLICY "Everyone can read shift types" ON public.shift_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admins können Schichttypen verwalten
CREATE POLICY "Admins can manage shift types" ON public.shift_types
  FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Alle können Schichten lesen (für Kalenderansicht)
CREATE POLICY "Everyone can read shifts" ON public.shifts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admins können Schichten verwalten
CREATE POLICY "Admins can manage shifts" ON public.shifts
  FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Mitarbeiter können ihre eigenen Präferenzen verwalten
CREATE POLICY "Users can manage their preferences" ON public.employee_shift_preferences
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM employees WHERE id = employee_id));

-- Admins können alle Präferenzen verwalten
CREATE POLICY "Admins can manage all preferences" ON public.employee_shift_preferences
  FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Mitarbeiter können ihre eigene Verfügbarkeit verwalten
CREATE POLICY "Users can manage their availability" ON public.employee_availability
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM employees WHERE id = employee_id));

-- Admins können alle Verfügbarkeiten verwalten
CREATE POLICY "Admins can manage all availability" ON public.employee_availability
  FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));