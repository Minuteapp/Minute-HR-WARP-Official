-- Tabelle für Mitarbeiter-Skills erstellen
CREATE TABLE IF NOT EXISTS public.employee_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 5),
  certification_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS für employee_skills aktivieren
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;

-- Policies für employee_skills
CREATE POLICY "Users can view skills from their company" 
ON public.employee_skills 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = employee_skills.employee_id 
    AND (
      e.company_id = (auth.jwt() ->> 'company_id')::uuid 
      OR (auth.jwt() ->> 'role') = 'superadmin'
    )
  )
);

CREATE POLICY "Admins can manage skills" 
ON public.employee_skills 
FOR ALL 
USING (
  (auth.jwt() ->> 'role') IN ('admin', 'superadmin')
  AND EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = employee_skills.employee_id 
    AND (
      e.company_id = (auth.jwt() ->> 'company_id')::uuid 
      OR (auth.jwt() ->> 'role') = 'superadmin'
    )
  )
);

-- Index für bessere Performance
CREATE INDEX idx_employee_skills_employee_id ON public.employee_skills(employee_id);
CREATE INDEX idx_employee_skills_skill_name ON public.employee_skills(skill_name);

-- Trigger für updated_at
CREATE TRIGGER update_employee_skills_updated_at
  BEFORE UPDATE ON public.employee_skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabelle für Fuhrpark-Zuweisungen erstellen
CREATE TABLE IF NOT EXISTS public.hr_fleet_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.hr_fleet_vehicles(id) ON DELETE CASCADE,
  assigned_from DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_until DATE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS für hr_fleet_assignments aktivieren
ALTER TABLE public.hr_fleet_assignments ENABLE ROW LEVEL SECURITY;

-- Policies für hr_fleet_assignments
CREATE POLICY "Users can view fleet assignments from their company" 
ON public.hr_fleet_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = hr_fleet_assignments.employee_id 
    AND (
      e.company_id = (auth.jwt() ->> 'company_id')::uuid 
      OR (auth.jwt() ->> 'role') = 'superadmin'
    )
  )
);

CREATE POLICY "Admins can manage fleet assignments" 
ON public.hr_fleet_assignments 
FOR ALL 
USING (
  (auth.jwt() ->> 'role') IN ('admin', 'superadmin')
  AND EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = hr_fleet_assignments.employee_id 
    AND (
      e.company_id = (auth.jwt() ->> 'company_id')::uuid 
      OR (auth.jwt() ->> 'role') = 'superadmin'
    )
  )
);

-- Index für bessere Performance
CREATE INDEX idx_hr_fleet_assignments_employee_id ON public.hr_fleet_assignments(employee_id);
CREATE INDEX idx_hr_fleet_assignments_vehicle_id ON public.hr_fleet_assignments(vehicle_id);

-- Trigger für updated_at
CREATE TRIGGER update_hr_fleet_assignments_updated_at
  BEFORE UPDATE ON public.hr_fleet_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();